const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture, anyValue } = require("@nomicfoundation/hardhat-network-helpers");

describe("HodlVault", function () {
  // Define durations
  const ONE_MONTH = 30 * 24 * 60 * 60; // 30 days
  const SIX_MONTHS = 180 * 24 * 60 * 60; // 180 days
  const ONE_YEAR = 365 * 24 * 60 * 60; // 365 days
  const THREE_YEARS = 1095 * 24 * 60 * 60; // 1095 days
  const TEN_YEARS = 3650 * 24 * 60 * 60; // 3650 days

  async function deployVaultFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy HodlVault
    const HodlVault = await ethers.getContractFactory("HodlVault");
    const vault = await HodlVault.deploy();
    await vault.waitForDeployment();

    // Deploy test ERC20 tokens
    const TestToken = await ethers.getContractFactory("TestERC20");
    const token1 = await TestToken.deploy("Test Token 1", "TT1", ethers.parseEther("1000000"));
    const token2 = await TestToken.deploy("Test Token 2", "TT2", ethers.parseEther("1000000"));
    
    await token1.waitForDeployment();
    await token2.waitForDeployment();

    // Transfer tokens to users for testing
    await token1.transfer(user1.address, ethers.parseEther("10000"));
    await token1.transfer(user2.address, ethers.parseEther("10000"));
    await token2.transfer(user1.address, ethers.parseEther("10000"));
    await token2.transfer(user2.address, ethers.parseEther("10000"));

    return { vault, token1, token2, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should deploy with correct owner", async function () {
      const { vault, owner } = await loadFixture(deployVaultFixture);
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("Should start with zero total locks", async function () {
      const { vault } = await loadFixture(deployVaultFixture);
      expect(await vault.totalLocks()).to.equal(0);
    });

    it("Should start unpaused", async function () {
      const { vault } = await loadFixture(deployVaultFixture);
      expect(await vault.paused()).to.equal(false);
    });
  });

  describe("Lock Creation", function () {
    it("Should successfully lock tokens for 1 month", async function () {
      const { vault, token1, user1 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("100");

      // Approve vault to spend tokens
      await token1.connect(user1).approve(await vault.getAddress(), amount);

      // Lock tokens
      const tx = await vault.connect(user1).lockTokens(
        await token1.getAddress(),
        amount,
        ONE_MONTH
      );
      
      // Check event was emitted
      await expect(tx).to.emit(vault, "LockCreated");

      // Check lock was created
      const locks = await vault.getUserLocks(user1.address);
      expect(locks.length).to.equal(1);
      expect(locks[0].amount).to.equal(amount);
      expect(locks[0].token).to.equal(await token1.getAddress());
      expect(locks[0].claimed).to.equal(false);
    });

    it("Should lock tokens for all valid durations", async function () {
      const { vault, token1, user1 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("10");
      const durations = [ONE_MONTH, SIX_MONTHS, ONE_YEAR, THREE_YEARS, TEN_YEARS];

      for (const duration of durations) {
        await token1.connect(user1).approve(await vault.getAddress(), amount);
        await expect(vault.connect(user1).lockTokens(
          await token1.getAddress(),
          amount,
          duration
        )).to.not.be.reverted;
      }

      const locks = await vault.getUserLocks(user1.address);
      expect(locks.length).to.equal(durations.length);
    });

    it("Should reject invalid duration", async function () {
      const { vault, token1, user1 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("100");
      const invalidDuration = 60 * 60 * 24 * 60; // 60 days

      await token1.connect(user1).approve(await vault.getAddress(), amount);
      
      await expect(vault.connect(user1).lockTokens(
        await token1.getAddress(),
        amount,
        invalidDuration
      )).to.be.revertedWith("Invalid lock duration");
    });

    it("Should reject zero amount", async function () {
      const { vault, token1, user1 } = await loadFixture(deployVaultFixture);
      
      await expect(vault.connect(user1).lockTokens(
        await token1.getAddress(),
        0,
        ONE_MONTH
      )).to.be.revertedWith("Amount must be greater than zero");
    });

    it("Should reject zero address token", async function () {
      const { vault, user1 } = await loadFixture(deployVaultFixture);
      
      await expect(vault.connect(user1).lockTokens(
        ethers.ZeroAddress,
        ethers.parseEther("100"),
        ONE_MONTH
      )).to.be.revertedWith("Invalid token address");
    });

    it("Should handle multiple locks from same user", async function () {
      const { vault, token1, token2, user1 } = await loadFixture(deployVaultFixture);
      const amount1 = ethers.parseEther("50");
      const amount2 = ethers.parseEther("75");

      // Lock token1
      await token1.connect(user1).approve(await vault.getAddress(), amount1);
      await vault.connect(user1).lockTokens(await token1.getAddress(), amount1, ONE_MONTH);

      // Lock token2
      await token2.connect(user1).approve(await vault.getAddress(), amount2);
      await vault.connect(user1).lockTokens(await token2.getAddress(), amount2, SIX_MONTHS);

      const locks = await vault.getUserLocks(user1.address);
      expect(locks.length).to.equal(2);
      expect(locks[0].token).to.equal(await token1.getAddress());
      expect(locks[1].token).to.equal(await token2.getAddress());
    });

    it("Should transfer tokens to vault", async function () {
      const { vault, token1, user1 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("100");
      
      const userBalanceBefore = await token1.balanceOf(user1.address);
      const vaultBalanceBefore = await token1.balanceOf(await vault.getAddress());

      await token1.connect(user1).approve(await vault.getAddress(), amount);
      await vault.connect(user1).lockTokens(await token1.getAddress(), amount, ONE_MONTH);

      const userBalanceAfter = await token1.balanceOf(user1.address);
      const vaultBalanceAfter = await token1.balanceOf(await vault.getAddress());

      expect(userBalanceAfter).to.equal(userBalanceBefore - amount);
      expect(vaultBalanceAfter).to.equal(vaultBalanceBefore + amount);
    });
  });

  describe("Claiming", function () {
    it("Should successfully claim after unlock time", async function () {
      const { vault, token1, user1 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("100");

      // Lock tokens
      await token1.connect(user1).approve(await vault.getAddress(), amount);
      await vault.connect(user1).lockTokens(await token1.getAddress(), amount, ONE_MONTH);

      // Move time forward past unlock time
      await time.increase(ONE_MONTH + 1);

      // Claim tokens
      const userBalanceBefore = await token1.balanceOf(user1.address);
      
      await expect(vault.connect(user1).claimTokens(0))
        .to.emit(vault, "LockClaimed")
        .withArgs(0, user1.address, await token1.getAddress(), amount);

      const userBalanceAfter = await token1.balanceOf(user1.address);
      expect(userBalanceAfter).to.equal(userBalanceBefore + amount);

      // Check lock is marked as claimed
      const locks = await vault.getUserLocks(user1.address);
      expect(locks[0].claimed).to.equal(true);
    });

    it("Should reject claim before unlock time", async function () {
      const { vault, token1, user1 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("100");

      // Lock tokens
      await token1.connect(user1).approve(await vault.getAddress(), amount);
      await vault.connect(user1).lockTokens(await token1.getAddress(), amount, ONE_MONTH);

      // Try to claim immediately
      await expect(vault.connect(user1).claimTokens(0))
        .to.be.revertedWith("Still locked");
    });

    it("Should reject double claim", async function () {
      const { vault, token1, user1 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("100");

      // Lock and claim
      await token1.connect(user1).approve(await vault.getAddress(), amount);
      await vault.connect(user1).lockTokens(await token1.getAddress(), amount, ONE_MONTH);
      await time.increase(ONE_MONTH + 1);
      await vault.connect(user1).claimTokens(0);

      // Try to claim again
      await expect(vault.connect(user1).claimTokens(0))
        .to.be.revertedWith("Already claimed");
    });

    it("Should reject claim by non-owner", async function () {
      const { vault, token1, user1, user2 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("100");

      // User1 locks tokens
      await token1.connect(user1).approve(await vault.getAddress(), amount);
      await vault.connect(user1).lockTokens(await token1.getAddress(), amount, ONE_MONTH);
      await time.increase(ONE_MONTH + 1);

      // User2 tries to claim
      await expect(vault.connect(user2).claimTokens(0))
        .to.be.revertedWith("Not lock owner");
    });
  });

  describe("View Functions", function () {
    it("Should return active locks correctly", async function () {
      const { vault, token1, user1 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("50");

      // Create 3 locks
      for (let i = 0; i < 3; i++) {
        await token1.connect(user1).approve(await vault.getAddress(), amount);
        await vault.connect(user1).lockTokens(await token1.getAddress(), amount, ONE_MONTH);
      }

      // Claim one lock
      await time.increase(ONE_MONTH + 1);
      await vault.connect(user1).claimTokens(0);

      // Check active locks
      const activeLocks = await vault.getActiveLocks(user1.address);
      expect(activeLocks.length).to.equal(2);
      expect(activeLocks[0].claimed).to.equal(false);
      expect(activeLocks[1].claimed).to.equal(false);
    });

    it("Should check claimability correctly", async function () {
      const { vault, token1, user1 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("100");

      // Lock tokens
      await token1.connect(user1).approve(await vault.getAddress(), amount);
      await vault.connect(user1).lockTokens(await token1.getAddress(), amount, ONE_MONTH);

      // Check before unlock time
      expect(await vault.isClaimable(0)).to.equal(false);

      // Check after unlock time
      await time.increase(ONE_MONTH + 1);
      expect(await vault.isClaimable(0)).to.equal(true);

      // Check after claiming
      await vault.connect(user1).claimTokens(0);
      expect(await vault.isClaimable(0)).to.equal(false);
    });

    it("Should get lock by ID correctly", async function () {
      const { vault, token1, user1 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("100");

      // Lock tokens
      await token1.connect(user1).approve(await vault.getAddress(), amount);
      await vault.connect(user1).lockTokens(await token1.getAddress(), amount, ONE_MONTH);

      // Get lock by ID
      const lock = await vault.getLockById(0);
      expect(lock.token).to.equal(await token1.getAddress());
      expect(lock.amount).to.equal(amount);
      expect(lock.claimed).to.equal(false);
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause", async function () {
      const { vault, owner } = await loadFixture(deployVaultFixture);
      
      await vault.connect(owner).pause();
      expect(await vault.paused()).to.equal(true);
    });

    it("Should allow owner to unpause", async function () {
      const { vault, owner } = await loadFixture(deployVaultFixture);
      
      await vault.connect(owner).pause();
      await vault.connect(owner).unpause();
      expect(await vault.paused()).to.equal(false);
    });

    it("Should reject lock creation when paused", async function () {
      const { vault, token1, owner, user1 } = await loadFixture(deployVaultFixture);
      
      await vault.connect(owner).pause();
      
      await token1.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await expect(vault.connect(user1).lockTokens(
        await token1.getAddress(),
        ethers.parseEther("100"),
        ONE_MONTH
      )).to.be.revertedWithCustomError(vault, "EnforcedPause");
    });

    it("Should allow claiming when paused", async function () {
      const { vault, token1, owner, user1 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("100");

      // Lock tokens before pausing
      await token1.connect(user1).approve(await vault.getAddress(), amount);
      await vault.connect(user1).lockTokens(await token1.getAddress(), amount, ONE_MONTH);

      // Pause contract
      await vault.connect(owner).pause();

      // Move time forward and claim
      await time.increase(ONE_MONTH + 1);
      await expect(vault.connect(user1).claimTokens(0)).to.not.be.reverted;
    });

    it("Should reject pause by non-owner", async function () {
      const { vault, user1 } = await loadFixture(deployVaultFixture);
      
      await expect(vault.connect(user1).pause())
        .to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });

  describe("Gas Optimization", function () {
    it("Should have reasonable gas costs for lock creation", async function () {
      const { vault, token1, user1 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("100");

      await token1.connect(user1).approve(await vault.getAddress(), amount);
      
      const tx = await vault.connect(user1).lockTokens(
        await token1.getAddress(),
        amount,
        ONE_MONTH
      );
      
      const receipt = await tx.wait();
      console.log("Lock creation gas used:", receipt.gasUsed.toString());
      
      // Gas should be reasonable (less than 270k for initial storage)
      expect(receipt.gasUsed).to.be.lessThan(270000n);
    });

    it("Should have reasonable gas costs for claiming", async function () {
      const { vault, token1, user1 } = await loadFixture(deployVaultFixture);
      const amount = ethers.parseEther("100");

      // Setup lock
      await token1.connect(user1).approve(await vault.getAddress(), amount);
      await vault.connect(user1).lockTokens(await token1.getAddress(), amount, ONE_MONTH);
      await time.increase(ONE_MONTH + 1);

      // Measure claim gas
      const tx = await vault.connect(user1).claimTokens(0);
      const receipt = await tx.wait();
      console.log("Claim gas used:", receipt.gasUsed.toString());
      
      // Gas should be reasonable (less than 150k)
      expect(receipt.gasUsed).to.be.lessThan(150000n);
    });
  });
});

// Test ERC20 contract for testing
const TestERC20 = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}
`;