// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Diamond {
    receive() external payable {}
    struct Diamond {
        string id;
        string origin;
        address currentOwner;
        address[] transferHistory;
        uint256 price;
        bool forSale;
    }
    
    mapping(string => Diamond) public diamonds;
    mapping(string => bool) public diamondExists;
    mapping(address => string[]) private userDiamonds;

    event OwnershipTransferred(string indexed diamondId, address indexed oldOwner, address indexed newOwner);
    event DiamondForSale(string indexed diamondId, uint256 price);
    event DiamondSold(string indexed diamondId, address indexed oldOwner, address indexed newOwner, uint256 price);

    function addDiamond(string memory _id, string memory _origin, uint256 _initialPrice) public {
        require(!diamondExists[_id], "Diamond already exists");
        
        diamonds[_id] = Diamond({
            id: _id,
            origin: _origin,
            currentOwner: msg.sender,
            transferHistory: new address[](0),
            price: _initialPrice,
            forSale: false
        });
        
        diamondExists[_id] = true;
        userDiamonds[msg.sender].push(_id);
    }

    function transferOwnership(string memory _id, address _newOwner) public {
        require(diamondExists[_id], "Diamond does not exist");
        require(msg.sender == diamonds[_id].currentOwner, "Only the current owner can transfer ownership");
        
        diamonds[_id].transferHistory.push(diamonds[_id].currentOwner);
        
        address oldOwner = diamonds[_id].currentOwner;
        diamonds[_id].currentOwner = _newOwner;
        diamonds[_id].forSale = false;

        // Update userDiamonds mapping
        removeDiamondFromUser(oldOwner, _id);
        userDiamonds[_newOwner].push(_id);

        emit OwnershipTransferred(_id, oldOwner, _newOwner);
    }

    function getTransferHistory(string memory _id) public view returns (string[] memory) {
        require(diamondExists[_id], "Diamond does not exist");
        
        address[] memory history = diamonds[_id].transferHistory;
        string[] memory historyStrings = new string[](history.length);
        
        for (uint i = 0; i < history.length; i++) {
            historyStrings[i] = addressToString(history[i]);
        }
        
        return historyStrings;
    }

    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    function setForSale(string memory _id, uint256 _price) public {
        require(diamondExists[_id], "Diamond does not exist");
        require(msg.sender == diamonds[_id].currentOwner, "Only the current owner can set the diamond for sale");
        
        diamonds[_id].price = _price;
        diamonds[_id].forSale = true;

        emit DiamondForSale(_id, _price);
    }

 
    function buyDiamond(string memory _id) public payable {
        require(diamondExists[_id], "Error 1: Diamond does not exist");
        require(diamonds[_id].forSale, "Error 2: Diamond is not for sale");
        // require(msg.value >= diamonds[_id].price, "Error 3: Insufficient payment");
        require(msg.sender != diamonds[_id].currentOwner, "Error 4: Owner cannot buy their own diamond");

        address payable oldOwner = payable(diamonds[_id].currentOwner);
        uint256 price = diamonds[_id].price;

        // Update ownership
        diamonds[_id].transferHistory.push(diamonds[_id].currentOwner);
        diamonds[_id].currentOwner = msg.sender;
        diamonds[_id].forSale = false;

        // Update userDiamonds mapping
        removeDiamondFromUser(oldOwner, _id);
        userDiamonds[msg.sender].push(_id);
        oldOwner.transfer(price);
        // Transfer the payment to the old owner
        // (bool sent, ) = oldOwner.call{value: price}("");
        // require(sent, "Error 5: Failed to send Ether");

        // Refund any excess payment
        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool refundSent, ) = payable(msg.sender).call{value: excess}("");
            require(refundSent, "Error 6: Failed to refund excess");
        }

        emit DiamondSold(_id, oldOwner, msg.sender, price);
    }

    function cancelSale(string memory _id) public {
        require(diamondExists[_id], "Diamond does not exist");
        require(msg.sender == diamonds[_id].currentOwner, "Only the current owner can cancel the sale");
        require(diamonds[_id].forSale, "Diamond is not for sale");

        diamonds[_id].forSale = false;
    }

    function getUserDiamonds(address _user) public view returns (string[] memory) {
        return userDiamonds[_user];
    }

    function removeDiamondFromUser(address _user, string memory _diamondId) internal {
        string[] storage userDiamondsList = userDiamonds[_user];
        for (uint i = 0; i < userDiamondsList.length; i++) {
            if (keccak256(bytes(userDiamondsList[i])) == keccak256(bytes(_diamondId))) {
                // Move the last element to the place of the removed element
                userDiamondsList[i] = userDiamondsList[userDiamondsList.length - 1];
                // Remove the last element
                userDiamondsList.pop();
                break;
            }
        }
    }
}