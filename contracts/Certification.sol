// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Certification {

    struct Certificate {
        string itemId;
        string certifyingAuthority;
        string certificationDetails;
        bool isCertified;
    }
    
    mapping(string => Certificate) public certifications;
    mapping(string => bool) public certificationExists;

    // Event for logging certification
    event Certified(string indexed itemId, string certifyingAuthority, string certificationDetails);

    // Certify an item by storing its details
    function certifyItem(
        string memory _itemId, 
        string memory _certifyingAuthority, 
        string memory _details
    ) public {
        require(!certificationExists[_itemId], "Item is already certified");
        
        certifications[_itemId] = Certificate(_itemId, _certifyingAuthority, _details, true);
        certificationExists[_itemId] = true;
        
        emit Certified(_itemId, _certifyingAuthority, _details);
    }

    // Get the certification details of an item
    function getCertificationDetails(string memory _itemId) public view returns (string memory, string memory) {
        require(certificationExists[_itemId], "Item is not certified");
        
        Certificate memory cert = certifications[_itemId];
        return (cert.certifyingAuthority, cert.certificationDetails);
    }

    // Verify if an item is certified
    function verifyCertification(string memory _itemId) public view returns (bool) {
        return certificationExists[_itemId];
    }
}
