// src/Certification.js
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import CertificationContract from '../contracts/Certification.json'; // Adjust the path as necessary

const contractAddress = "0x5E478865e1Ffdc1C4688ae69Bd5Ee7B8E9229af9"; // Replace with your deployed contract address

const Certification = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [itemId, setItemId] = useState("");
  const [certifyingAuthority, setCertifyingAuthority] = useState("");
  const [certificationDetails, setCertificationDetails] = useState("");
  const [certificationExists, setCertificationExists] = useState(false);
  const [fetchDetails, setFetchDetails] = useState({ authority: "", details: "" });

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, CertificationContract.abi, signer);
        setContract(contract);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
      }
    };
    init();
  }, []);

  const handleCertifyItem = async () => {
    try {
      const tx = await contract.certifyItem(itemId, certifyingAuthority, certificationDetails);
      await tx.wait();
      alert("Item certified successfully!");
    } catch (error) {
      console.error("Error certifying item:", error);
    }
  };

  const handleVerifyCertification = async () => {
    const exists = await contract.verifyCertification(itemId);
    setCertificationExists(exists);
  };

  const handleFetchCertificationDetails = async () => {
    try {
      const [authority, details] = await contract.getCertificationDetails(itemId);
      setFetchDetails({ authority, details });
    } catch (error) {
      console.error("Error fetching certification details:", error);
    }
  };

  return (
    <div className="bg-blue-300 min-h-screen p-6">
    <div className="container mx-auto p-50 max-w-96">
      <h1 className="text-2xl font-bold mb-4">Certification System</h1>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Certify an Item</h2>
        <input
          type="text"
          placeholder="Item ID"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="input input-bordered mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Certifying Authority"
          value={certifyingAuthority}
          onChange={(e) => setCertifyingAuthority(e.target.value)}
          className="input input-bordered mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Certification Details"
          value={certificationDetails}
          onChange={(e) => setCertificationDetails(e.target.value)}
          className="input input-bordered mb-2 w-full"
        />
        <button onClick={handleCertifyItem} className="btn btn-accent">Certify Item</button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Verify Certification</h2>
        <input
          type="text"
          placeholder="Item ID"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="input input-bordered mb-2 w-full"
        />
        <button onClick={handleVerifyCertification} className="btn btn-accent">Verify Certification</button>
        {certificationExists !== null && (
          <p className="mt-2">{certificationExists ? "Item is certified." : "Item is not certified."}</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Get Certification Details</h2>
        <input
          type="text"
          placeholder="Item ID"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="input input-bordered mb-2 w-full"
        />
        <button onClick={handleFetchCertificationDetails} className="btn btn-accent">Fetch Details</button>
        {fetchDetails.authority && (
          <div className="mt-2">
            <p><strong>Certifying Authority:</strong> {fetchDetails.authority}</p>
            <p><strong>Details:</strong> {fetchDetails.details}</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Certification;
