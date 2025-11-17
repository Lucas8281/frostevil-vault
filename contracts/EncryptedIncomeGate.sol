// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat-deploy/solc_0.8/openzeppelin/access/Ownable.sol";
import {FHE, euint32, euint64, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Income Threshold Gate Contract
/// @notice A confidential income verification system using FHEVM to check if income meets a threshold (e.g., 5500)
contract EncryptedIncomeGate is SepoliaConfig, Ownable {
    // Encrypted storage for user incomes
    mapping(address => euint32) private _encryptedIncomes;
    mapping(address => bool) private _hasSubmitted;

    // Statistical data (encrypted)
    euint64 private _totalUsers;
    euint64 private _sumIncomes;
    euint32 private _minIncome;
    euint32 private _maxIncome;

    // Events
    event IncomeSubmitted(address indexed user);
    event IncomeVerified(address indexed user, bool isAboveThreshold);

    /// @notice Constructor sets the owner of the contract
    constructor() Ownable(msg.sender) {}

    /// @notice Submit encrypted income data
    /// @param encryptedIncome The user's income encrypted with FHE
    /// @param inputProof Zero-knowledge proof for the encrypted input
    function submitEncryptedIncome(externalEuint32 encryptedIncome, bytes calldata inputProof) external {
        require(!_hasSubmitted[msg.sender], "Income already submitted");
        // Verify and convert the external encrypted income to an internal euint32
        euint32 income = FHE.fromExternal(encryptedIncome, inputProof);
        // Store encrypted income
        _encryptedIncomes[msg.sender] = income;
        _hasSubmitted[msg.sender] = true;
        // Update statistics (all operations are performed on encrypted data)
        _totalUsers = FHE.add(_totalUsers, FHE.asEuint64(1));
        _sumIncomes = FHE.add(_sumIncomes, FHE.asEuint64(income));
        // Update min/max incomes
        if (FHE.decrypt(_minIncome) == 0 || FHE.lt(income, _minIncome)) {
            _minIncome = income;
        }
        if (FHE.gt(income, _maxIncome)) {
            _maxIncome = income;
        }
        emit IncomeSubmitted(msg.sender);
    }

    /// @notice Verify if user's income meets or exceeds a specific threshold (e.g., 5500)
    /// @param threshold The income threshold to check against (plaintext)
    /// @return isAboveThreshold Whether the user's income is at or above the threshold
    function verifyIncomeThreshold(uint32 threshold) external view returns (bool isAboveThreshold) {
        require(_hasSubmitted[msg.sender], "Income not submitted");
        // Convert the plaintext threshold to an encrypted euint32
        euint32 requiredThreshold = FHE.asEuint32(threshold);
        // Retrieve the user's encrypted income
        euint32 userIncome = _encryptedIncomes[msg.sender];
        // Compare the encrypted income with the encrypted threshold
        // FHE.gte returns an encrypted boolean (ebool)
        isAboveThreshold = FHE.decrypt(FHE.gte(userIncome, requiredThreshold));
        emit IncomeVerified(msg.sender, isAboveThreshold);
    }

    /// @notice Get encrypted statistical data about all submitted incomes
    /// @return totalUsers Total number of users (encrypted)
    /// @return averageIncome Average income (encrypted)
    /// @return minIncome Minimum income (encrypted)
    /// @return maxIncome Maximum income (encrypted)
    function getEncryptedStats() external view returns (
        euint64 totalUsers,
        euint64 averageIncome,
        euint32 minIncome,
        euint32 maxIncome
    ) {
        // Calculate average income, handle division by zero
        euint64 count = FHE.select(FHE.eq(_totalUsers, FHE.asEuint64(0)), FHE.asEuint64(1), _totalUsers);
        averageIncome = FHE.div(_sumIncomes, count);
        return (_totalUsers, averageIncome, _minIncome, _maxIncome);
    }

    /// @notice Decrypt statistical results (owner only)
    /// @return totalUsers Total number of users
    /// @return averageIncome Average income
    /// @return minIncome Minimum income
    /// @return maxIncome Maximum income
    function decryptStats() external view onlyOwner returns (
        uint64 totalUsers,
        uint64 averageIncome,
        uint32 minIncome,
        uint32 maxIncome
    ) {
        (euint64 encTotal, euint64 encAvg, euint32 encMin, euint32 encMax) = getEncryptedStats();
        return (
            FHE.decrypt(encTotal),
            FHE.decrypt(encAvg),
            FHE.decrypt(encMin),
            FHE.decrypt(encMax)
        );
    }

    /// @notice Check if a user has submitted their income
    /// @param user The user address to check
    /// @return hasSubmitted Whether the user has submitted their income
    function hasUserSubmitted(address user) external view returns (bool hasSubmitted) {
        return _hasSubmitted[user];
    }

    /// @notice Get user's own encrypted income (for frontend display, if needed)
    /// @return encryptedIncome The user's encrypted income
    function getMyEncryptedIncome() external view returns (euint32 encryptedIncome) {
        require(_hasSubmitted[msg.sender], "Income not submitted");
        return _encryptedIncomes[msg.sender];
    }
}