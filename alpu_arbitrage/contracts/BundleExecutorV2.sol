//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

pragma experimental ABIEncoderV2;

import {FlashLoanSimpleReceiverBase} from "./aave/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "./aave/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "./interfaces/IERC20.sol";

// This contract simply calls multiple targets sequentially, ensuring WETH balance before and after

struct Balances {
    uint256 _ethBalance;
    uint256 _startBalance;
    uint256 _endBalance;
}

contract BundleExecutorV2 is FlashLoanSimpleReceiverBase {
    address private executor = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private owner = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    constructor(
        address _executor,
        address _addressProvider
    ) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) {
        executor = _executor;
        owner = payable(msg.sender);
    }

    function executeTxBundle(
        address _token,
        uint256 _amountToFirstMarket,
        address[] calldata _targets,
        bytes[] calldata _payloads
    ) public payable onlyExecutor {
        address receiverAddress = address(this);
        bytes memory params = abi.encode(
            _targets,
            _payloads
        );
        uint16 referralCode = 0;

        POOL.flashLoanSimple(
            receiverAddress,
            _token,
            _amountToFirstMarket,
            params,
            referralCode
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        (
            address[] memory targets,
            bytes[] memory payloads
        ) = abi.decode(params, (address[], bytes[]));

        require(targets.length == payloads.length, "invalid data");

        IERC20 token = IERC20(asset);
        Balances memory balances = Balances(
            address(this).balance,
            token.balanceOf(address(this)),
            0
        );

        token.transfer(targets[0], amount);

        uint256 i = 0;
        bool _success;
        bytes memory _response;
        do {
            (_success, _response) = targets[i].call(payloads[i]);
            require(_success, "FAILED");
            _response;

            unchecked {
                ++i;
            }
        } while (i < targets.length);

        // Ensure Profit
        unchecked {
            balances._endBalance = token.balanceOf(address(this));
            require(
                balances._endBalance > balances._startBalance,
                "no profit made"
            );
        }

        // Transfer net profit back to wallet and approve flash loan return
        uint256 amountOwed = amount + premium;
        uint256 netProfit = balances._endBalance - amountOwed;

        token.transfer(owner, netProfit);
        token.approve(address(POOL), amountOwed);

        return true;
    }

    function call(
        address payable _to,
        uint256 _value,
        bytes calldata _data
    ) external payable onlyOwner returns (bytes memory) {
        require(_to != address(0), "null address in call is not allowed");

        (bool _success, bytes memory _result) = _to.call{value: _value}(_data);
        require(_success, "call failed");
        return _result;
    }

    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function getBalance(address _tokenAddress) external view returns (uint256) {
        return IERC20(_tokenAddress).balanceOf(address(this));
    }

    function withdraw(address _tokenAddress) external onlyOwner {
        IERC20 token = IERC20(_tokenAddress);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    modifier onlyOwner() {
        address _owner = owner;
        require(msg.sender == _owner, "owner access only");
        _;
    }
    modifier onlyExecutor() {
        address _executor = executor;
        require(msg.sender == _executor, "executor access only");
        _;
    }

    function getFlashLoanFees() external view returns (uint128) {
        return POOL.FLASHLOAN_PREMIUM_TOTAL();
    }

    receive() external payable {}
}
