pragma solidity ^0.5.11;

import "./Erc20Interface.sol";

contract PeggedToken is Erc20Interface {

    uint256 constant private MAX_UINT256 = 2 ** 256 - 1;
    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed;
    /*
    NOTE:
    The following variables are OPTIONAL vanities. One does not have to include them.
    They allow one to customise the token contract & in no way influences the core functionality.
    Some wallets/interfaces might not even bother to look at this information.
    */
    string public name;                   //fancy name: eg Simon Bucks
    uint8 public decimals;                //How many decimals to show.
    string public symbol;                 //An identifier: eg SBX

    address public systemAddress;
    address public systemLoansAddress;

    constructor(
        uint256 _initialAmount,
        string memory _tokenName,
        uint8 _decimalUnits,
        string memory _tokenSymbol
    ) public {
        balances[msg.sender] = _initialAmount;               // Give the creator all initial tokens
        totalSupply = _initialAmount;                        // Update total supply
        name = _tokenName;                                   // Set the name for display purposes
        decimals = _decimalUnits;                            // Amount of decimals for display purposes
        symbol = _tokenSymbol;                               // Set the symbol for display purposes
    }

    function initialize(
        address _systemAddress,
        address _systemLoansAddress
    )
    public
    {
        require(systemAddress == address(0), "systemAddress should be 0");
        require(systemLoansAddress == address(0), "systemLoansAddress should be 0");
        systemAddress = _systemAddress;
        systemLoansAddress = _systemLoansAddress;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balances[msg.sender] >= _value, "balances[msg.sender] >= _value");
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value); //solhint-disable-line indent, no-unused-vars
        return true;
    }

    function mint(address _address, uint256 _value) public {
        require(systemLoansAddress == msg.sender, "mint should be called by systemLoans");
        balances[_address] += _value;
        emit Mint(_address, _value); //solhint-disable-line indent, no-unused-vars
    }

    function burn(address _address, uint256 _value) public {
        require(systemLoansAddress == msg.sender, "burn should be called by systemLoans");
        require(balances[_address] >= _value, "balances[_address] >= _value");
        balances[_address] -= _value;
        emit Burn(_address, _value); //solhint-disable-line indent, no-unused-vars
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        uint256 allowance = allowed[_from][msg.sender];
        require(balances[_from] >= _value && allowance >= _value, "balances[_from] >= _value && allowance >= _value");
        balances[_to] += _value;
        balances[_from] -= _value;
        if (allowance < MAX_UINT256) {
            allowed[_from][msg.sender] -= _value;
        }
        emit Transfer(_from, _to, _value); //solhint-disable-line indent, no-unused-vars
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value); //solhint-disable-line indent, no-unused-vars
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    event Mint(address indexed _address, uint256 _value);
    event Burn(address indexed _address, uint256 _value);
}