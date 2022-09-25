// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PayForSuccess {
  // Contract identification.
  address public immutable fakeTokenAddrForNativeCurrency = address(0);
  string private constant GREATER_THAN_ZERO = "value should be greater than zero";

  //Owners and admins.
  address public owner;
  address public admin;

  // ERC20 Token Deposits - Store actor/users wallet balance. UserAddress->AssetAddress->Amount
  mapping(address => mapping(address => uint256)) public UserInfo;

  //ETH deposits
  mapping(address => uint256) public UserEthInfo;

  //stores payer amount and URI for NFT issued to Payer
  struct Stake {
    uint256 amount; //amount contributed by Payer
    uint256 tokenIndex; //NFT TokenIndex issued to Payer
    address assetAddress; //Asset donated
  }
  mapping(address => Stake) public NFTHolders;

  address[] private s_donors;

  enum EventFlags {
    DEPOSITED,
    RELEASED,
    RESULTRELEASED,
    RESULTSIGNED
  }

  // Asset Received handling.
  event AssetReceived(
    address indexed from,
    uint256 amount,
    address indexed tokenAddress,
    EventFlags flag
  );

  //Clinical Submission Event
  event ClinicalResult(
    address indexed submitter,
    string indexed documentURI,
    uint32 clinicalTrialStage,
    EventFlags flag
  );
  //result signed
  event SignedClinicalResult(
    address indexed submitter,
    string documentURI,
    uint32 trialStage,
    string rootTxnId,
    bytes[] signatures,
    EventFlags indexed flag
  );

  // One time call: assigns our wallet address as the vault master.
  constructor(address _admin) {
    owner = msg.sender;
    admin = _admin;
  }

  modifier onlyOwner(address sender) {
    require(sender == admin, "Only the admin of the contract can perform this operation.");
    _;
  }

  function getContractName() public pure returns (string memory) {
    return "Pay4Success";
  }

  function getUserAsset(address assetAddress) public view returns (uint256 amount) {
    return UserInfo[msg.sender][assetAddress];
  }

  function getUserEthAmount() public view returns (uint256 amount) {
    return UserEthInfo[msg.sender];
  }

  receive() external payable {}

  /*
   * Deposit and transfer function:
   * The User needs to approve this contract with the amount of asset initially.
   * Using the ERC20 standard we then transfer the same amount of asset approved to this contract using transferFrom.
   * We modify the UserInfo to keep track of deposit operations.
   * we notify PFS contract providers/validators of transaction.
   */
  function depositAssets(uint256 amount, address assetAddress) public payable {
    require(msg.value < 1, GREATER_THAN_ZERO);

    if (UserInfo[msg.sender][assetAddress] < 0) {
      s_donors.push(msg.sender);
    }

    UserInfo[msg.sender][assetAddress] += amount;
    IERC20(assetAddress).transferFrom(msg.sender, address(this), amount);

    emit AssetReceived(msg.sender, amount, assetAddress, EventFlags.DEPOSITED);
  }

  //updates NFT URI with the asset deposited
  //one NFT issued per User
  function issueNFT(
    uint256 amount,
    address assetAddress,
    uint256 tokenIndex
  ) public {
    Stake memory stake;

    stake.amount = amount;
    stake.assetAddress = assetAddress;
    stake.tokenIndex = tokenIndex;

    NFTHolders[msg.sender] = stake;
  }

  /*
   * Deposit and transfer function:
   * The User needs to approve this contract with the amount of ETH initially.
   * We modify the UserInfo to keep track of deposit operations.
   * we notify PFS contract providers/validators of transaction.
   */
  function depositEth() public payable {
    //IERC20(fakeTokenAddrForNativeCurrency).transferFrom(msg.sender, address(this), msg.value);
    //UserInfo[msg.sender][fakeTokenAddrForNativeCurrency] += msg.value;

    require(msg.value > 0, GREATER_THAN_ZERO);

    if (UserEthInfo[msg.sender] < 0) {
      s_donors.push(msg.sender);
    }

    UserEthInfo[msg.sender] += msg.value;

    //emit asset received event
    emit AssetReceived(
      msg.sender,
      msg.value,
      fakeTokenAddrForNativeCurrency,
      EventFlags.DEPOSITED
    );
  }

  //Return all funders list
  function getDonors() public view returns (address[] memory) {
    return s_donors;
  }

  //get the funder for the index
  function getDonor(uint256 index) public view returns (address) {
    return s_donors[index];
  }

  //get no of donors
  function getDonorCount() public view returns (uint256 noOfDonors) {
    return s_donors.length;
  }

  //Submit URI for the documents submitted towards clinical trial results
  function submitClinialResult(string calldata documentURI, uint32 clinicalTrialStage) public {
    emit ClinicalResult(msg.sender, documentURI, clinicalTrialStage, EventFlags.RESULTRELEASED);
  }

  //Signed transaction posted on net
  function submitSignedClinialResult(
    string calldata documentURI,
    uint32 clinicalTrialStage,
    string calldata rootTxnId,
    bytes[] memory signatures
  ) public {
    emit SignedClinicalResult(
      msg.sender,
      documentURI,
      clinicalTrialStage,
      rootTxnId,
      signatures,
      EventFlags.RESULTSIGNED
    );
  }

  /*
   * Release function:
   * Check caller if PFS Contract owner.
   * We add tokens to user address.
   * We remove tokens from out vault.
   */
  function releaseAssets(
    uint256 amount,
    address userAddress,
    address assetAddress
  ) public onlyOwner(msg.sender) {
    uint256 _userAssetBalance = UserInfo[msg.sender][assetAddress];
    require(_userAssetBalance >= amount, "The user doesn't have enough amount of this asset.");
    UserInfo[msg.sender][assetAddress] -= amount;
    IERC20(assetAddress).transferFrom(address(this), userAddress, amount);
  }

  //
}
