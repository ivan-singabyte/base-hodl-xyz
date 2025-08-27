// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HodlVault
 * @notice A fully autonomous, trustless vault for locking ERC-20 tokens with fixed durations.
 * @dev No early withdrawal allowed - true diamond hands only! No admin controls - fully decentralized.
 */
contract HodlVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Lock {
        address token;      // ERC-20 token address
        uint256 amount;     // Amount locked
        uint256 lockTime;   // When the lock was created
        uint256 unlockTime; // When tokens can be claimed
        bool claimed;       // Whether tokens have been claimed
    }

    // User address => array of locks
    mapping(address => Lock[]) public userLocks;
    
    // Lock ID counter
    uint256 public lockIdCounter;
    
    // Mapping from lock ID to owner and index
    mapping(uint256 => address) public lockOwner;
    mapping(uint256 => uint256) public lockIndex;
    
    // Allowed lock durations in seconds
    uint256 public constant ONE_DAY = 1 days;
    uint256 public constant ONE_MONTH = 30 days;
    uint256 public constant SIX_MONTHS = 180 days;
    uint256 public constant ONE_YEAR = 365 days;
    uint256 public constant THREE_YEARS = 1095 days;
    uint256 public constant TEN_YEARS = 3650 days;
    
    // Statistics
    uint256 public totalLocks;
    mapping(address => uint256) public totalValueLocked;
    
    // Events
    event LockCreated(
        uint256 indexed lockId,
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 lockTime,
        uint256 unlockTime
    );
    
    event LockClaimed(
        uint256 indexed lockId,
        address indexed user,
        address indexed token,
        uint256 amount
    );

    constructor() {}

    /**
     * @notice Lock tokens for a specified duration
     * @param token The ERC-20 token address to lock
     * @param amount The amount of tokens to lock
     * @param duration The lock duration (must be one of the allowed durations)
     */
    function lockTokens(
        address token,
        uint256 amount,
        uint256 duration
    ) external returns (uint256 lockId) {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than zero");
        require(_isValidDuration(duration), "Invalid lock duration");
        
        // Transfer tokens from user to contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Create lock record
        Lock memory newLock = Lock({
            token: token,
            amount: amount,
            lockTime: block.timestamp,
            unlockTime: block.timestamp + duration,
            claimed: false
        });
        
        // Assign lock ID
        lockId = lockIdCounter++;
        
        // Store lock
        userLocks[msg.sender].push(newLock);
        uint256 lockIndexValue = userLocks[msg.sender].length - 1;
        
        // Store lock ownership info
        lockOwner[lockId] = msg.sender;
        lockIndex[lockId] = lockIndexValue;
        
        // Update statistics
        totalLocks++;
        totalValueLocked[token] += amount;
        
        // Emit event
        emit LockCreated(
            lockId,
            msg.sender,
            token,
            amount,
            block.timestamp,
            block.timestamp + duration
        );
        
        return lockId;
    }

    /**
     * @notice Claim unlocked tokens
     * @param lockId The ID of the lock to claim
     */
    function claimTokens(uint256 lockId) external nonReentrant {
        require(lockOwner[lockId] == msg.sender, "Not lock owner");
        
        uint256 index = lockIndex[lockId];
        Lock storage lock = userLocks[msg.sender][index];
        
        require(!lock.claimed, "Already claimed");
        require(block.timestamp >= lock.unlockTime, "Still locked");
        
        // Mark as claimed
        lock.claimed = true;
        
        // Update statistics
        totalValueLocked[lock.token] -= lock.amount;
        
        // Transfer tokens back to user
        IERC20(lock.token).safeTransfer(msg.sender, lock.amount);
        
        // Emit event
        emit LockClaimed(lockId, msg.sender, lock.token, lock.amount);
    }

    /**
     * @notice Get all locks for a user
     * @param user The user address
     * @return An array of Lock structs
     */
    function getUserLocks(address user) external view returns (Lock[] memory) {
        return userLocks[user];
    }

    /**
     * @notice Get active (unclaimed) locks for a user
     * @param user The user address
     * @return locks An array of active Lock structs
     */
    function getActiveLocks(address user) external view returns (Lock[] memory) {
        Lock[] memory allLocks = userLocks[user];
        uint256 activeCount = 0;
        
        // Count active locks
        for (uint256 i = 0; i < allLocks.length; i++) {
            if (!allLocks[i].claimed) {
                activeCount++;
            }
        }
        
        // Create array of active locks
        Lock[] memory activeLocks = new Lock[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allLocks.length; i++) {
            if (!allLocks[i].claimed) {
                activeLocks[currentIndex] = allLocks[i];
                currentIndex++;
            }
        }
        
        return activeLocks;
    }

    /**
     * @notice Check if a lock is claimable
     * @param lockId The lock ID to check
     * @return Whether the lock can be claimed
     */
    function isClaimable(uint256 lockId) external view returns (bool) {
        address owner = lockOwner[lockId];
        if (owner == address(0)) return false;
        
        uint256 index = lockIndex[lockId];
        Lock memory lock = userLocks[owner][index];
        
        return !lock.claimed && block.timestamp >= lock.unlockTime;
    }

    /**
     * @notice Get lock details by ID
     * @param lockId The lock ID
     * @return lock The Lock struct
     */
    function getLockById(uint256 lockId) external view returns (Lock memory) {
        address owner = lockOwner[lockId];
        require(owner != address(0), "Lock does not exist");
        
        uint256 index = lockIndex[lockId];
        return userLocks[owner][index];
    }

    /**
     * @notice Check if a duration is valid
     * @param duration The duration to check
     * @return Whether the duration is allowed
     */
    function _isValidDuration(uint256 duration) private pure returns (bool) {
        return duration == ONE_DAY ||
               duration == ONE_MONTH ||
               duration == SIX_MONTHS ||
               duration == ONE_YEAR ||
               duration == THREE_YEARS ||
               duration == TEN_YEARS;
    }

    /**
     * @notice Get statistics
     */
    function getStats() external view returns (
        uint256 totalLocksCount,
        uint256 totalUsers,
        uint256 currentlyLocked
    ) {
        totalLocksCount = totalLocks;
        
        // Count unique users (this is gas intensive, consider tracking separately)
        uint256 userCount = 0;
        uint256 lockedCount = 0;
        
        // Note: This is a simplified version. In production, you might want to
        // maintain these stats separately for gas efficiency
        
        return (totalLocksCount, userCount, lockedCount);
    }
}