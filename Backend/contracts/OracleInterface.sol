// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title The interface for the events Oracle (`WagerOracle`)
 * @notice Declares the functions that the `WagerOracle` contract exposes externally
 */
interface OracleInterface {

    /**
     * @dev The possible outcomes for an event
     * Keep in sync the `EventOutcome` constant in `WagerOracle.txt.js` when updating this enum.
     */
    enum EventOutcome {
        Pending,    //match has not been fought to decision
        Underway,   //match has started & is underway
        Draw,       //anything other than a clear winner (e.g. cancelled)
        Decided     //index of participant who is the winner
    }

    function eventExists(bytes32 _eventId)
        external view returns (bool);

    function getPendingEvents()
        external view returns (bytes32[] memory);

    function getAllSportEvents()
        external view returns (bytes32[] memory);

    function getEvent(bytes32 _eventId)
        external view returns (
            bytes32       id,
            string memory name,
            string memory teamAname,
            string memory teamBname,
            uint          date,
            EventOutcome  outcome,
            int8          winner
        );

    function getLatestEvent(bool _pending)
        external view returns (
            bytes32       id,
            string memory name,
            string memory teamAname,
            string memory teamBname,
            uint          date,
            EventOutcome  outcome,
            int8          winner
        );

    function testConnection()
        external pure returns (bool);

}