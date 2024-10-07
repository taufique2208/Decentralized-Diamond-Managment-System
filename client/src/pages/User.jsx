import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Diamond from '../contracts/Diamond.json';

const contractAddress = "0x42fFA719d27080c9771D31C5Fd3053193047Fb72";
const contractABI = Diamond.abi;

const User = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [allDiamonds, setAllDiamonds] = useState([]); // List of all diamonds
  const [userDiamonds, setUserDiamonds] = useState([]); // List of user-owned diamonds
  const [newDiamond, setNewDiamond] = useState({ id: "", origin: "", price: 0 });
  const [transferData, setTransferData] = useState({ diamondId: "", newOwner: "" });
  const [saleData, setSaleData] = useState({ diamondId: "", price: 0 });
  const [buyData, setBuyData] = useState({ diamondId: "" }); // New state for buy form
  const [ownershipHistory, setOwnershipHistory] = useState({ diamondId: "", history: [] });

  useEffect(() => {
    const initContract = async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contract);

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        fetchDiamonds(accounts[0]); // Fetch diamonds after account is set
        fetchAllDiamonds(); // Fetch all diamonds
      }
    };
    initContract();
  }, []);

  const handleAddDiamond = async () => {
    const { id, origin, price } = newDiamond;
    await contract.addDiamond(id, origin, ethers.utils.parseEther(price.toString()));
    fetchDiamonds(account); // Refresh user diamonds after adding a new diamond
    fetchAllDiamonds(); // Refresh all diamonds after adding
  };

  const handleTransferOwnership = async () => {
    const { diamondId, newOwner } = transferData;
    await contract.transferOwnership(diamondId, newOwner);
    fetchDiamonds(account); // Refresh user diamonds after ownership transfer
    fetchAllDiamonds(); // Refresh all diamonds after transfer
  };

  const handleSetForSale = async () => {
    const { diamondId, price } = saleData;
    await contract.setForSale(diamondId, ethers.utils.parseEther(price.toString()));
    fetchAllDiamonds(); // Refresh all diamonds after setting for sale
  };

  const handleBuyDiamond = async (diamondId) => {
    const diamond = allDiamonds.find(d => d.id === diamondId);
    console.log(diamond)
    // if (diamond && diamond.forSale) {
        try{
      await contract.buyDiamond(diamondId, { value: ethers.utils.parseEther("10.0") });
        }catch(e){
            console.log(e)
        }
      fetchDiamonds(account); // Refresh user diamonds after purchase
    //   fetchAllDiamonds(); // Refresh all diamonds after purchase
    // }
  };

  const fetchOwnershipHistory = async (diamondId) => {
    const history = await contract.getTransferHistory(diamondId);
    setOwnershipHistory({ diamondId, history });
  };

  const fetchDiamonds = async (userAccount) => {
    try {
      if (contract && userAccount) {
        const diamondIds = await contract.getUserDiamonds(userAccount);
        const diamondPromises = diamondIds.map(async (diamondId) => {
          const diamond = await contract.diamonds(diamondId);
          const { id, origin, currentOwner, price, forSale } = diamond;
          const formattedPrice = ethers.utils.formatEther(price);
          return {
            id,
            origin,
            currentOwner,
            price: formattedPrice,
            forSale,
          };
        });
        const diamondData = await Promise.all(diamondPromises);
        setUserDiamonds(diamondData); // Update user-owned diamonds
      }
    } catch (error) {
      console.error("Error fetching user diamonds:", error);
    }
  };

  const fetchAllDiamonds = async () => {
    try {
      // Assuming you have a method to retrieve all diamond IDs
      const allDiamondIds = Object.keys(await contract.diamonds()); // Update as per your contract method
      const allDiamondPromises = allDiamondIds.map(async (diamondId) => {
        const diamond = await contract.diamonds(diamondId);
        const { id, origin, currentOwner, price, forSale } = diamond;
        const formattedPrice = ethers.utils.formatEther(price);
        return {
          id,
          origin,
          currentOwner,
          price: formattedPrice,
          forSale,
        };
      });
      const allDiamondData = await Promise.all(allDiamondPromises);
      setAllDiamonds(allDiamondData); // Update all diamonds
    } catch (error) {
      console.error("Error fetching all diamonds:", error);
    }
  };

  return (
    <div className="bg-blue-300 min-h-screen p-6">
      <div className="grid grid-cols-2 gap-6">
        
        {/* Add Diamond Form */}
        <div className="card w-full bg-base-100 shadow-2xl border border-gray-200">
          <div className="card-body">
            <h2 className="card-title text-lg font-bold">Add New Diamond</h2>
            <div className="form-control w-full mb-3">
              <input
                type="text"
                placeholder="Diamond ID"
                className="input input-primary w-full"
                value={newDiamond.id}
                onChange={(e) => setNewDiamond({ ...newDiamond, id: e.target.value })}
              />
            </div>
            <div className="form-control w-full mb-3">
              <input
                type="text"
                placeholder="Origin"
                className="input input-primary w-full"
                value={newDiamond.origin}
                onChange={(e) => setNewDiamond({ ...newDiamond, origin: e.target.value })}
              />
            </div>
            <div className="form-control w-full mb-3">
              <input
                type="number"
                placeholder="Initial Price (ETH)"
                className="input input-primary w-full"
                value={newDiamond.price}
                onChange={(e) => setNewDiamond({ ...newDiamond, price: parseFloat(e.target.value) })}
              />
            </div>
            <button className="btn btn-accent w-full" onClick={handleAddDiamond}>
              Add Diamond
            </button>
          </div>
        </div>
  
        {/* Transfer Ownership Form */}
        <div className="card w-full bg-base-100 shadow-2xl border border-gray-200">
          <div className="card-body">
            <h2 className="card-title text-lg font-bold">Transfer Ownership</h2>
            <div className="form-control w-full mb-3">
              <input
                type="text"
                placeholder="Diamond ID"
                className="input input-accent w-full"
                value={transferData.diamondId}
                onChange={(e) => setTransferData({ ...transferData, diamondId: e.target.value })}
              />
            </div>
            <div className="form-control w-full mb-3">
              <input
                type="text"
                placeholder="New Owner Address"
                className="input input-accent w-full"
                value={transferData.newOwner}
                onChange={(e) => setTransferData({ ...transferData, newOwner: e.target.value })}
              />
            </div>
            <button className="btn btn-accent w-full" onClick={handleTransferOwnership}>
              Transfer Ownership
            </button>
          </div>
        </div>
  
        {/* Set For Sale Form */}
        <div className="card w-full bg-base-100 shadow-2xl border border-gray-200">
          <div className="card-body">
            <h2 className="card-title text-lg font-bold">Set For Sale</h2>
            <div className="form-control w-full mb-3">
              <input
                type="text"
                placeholder="Diamond ID"
                className="input input-info w-full"
                value={saleData.diamondId}
                onChange={(e) => setSaleData({ ...saleData, diamondId: e.target.value })}
              />
            </div>
            <div className="form-control w-full mb-3">
              <input
                type="number"
                placeholder="Price (ETH)"
                className="input input-info w-full"
                value={saleData.price}
                onChange={(e) => setSaleData({ ...saleData, price: parseFloat(e.target.value) })}
              />
            </div>
            <button className="btn btn-accent w-full" onClick={handleSetForSale}>
              Set For Sale
            </button>
          </div>
        </div>
  
        {/* Buy Diamond Form */}
        <div className="card w-full bg-base-100 shadow-2xl border border-gray-200">
          <div className="card-body">
            <h2 className="card-title text-lg font-bold">Buy Diamond</h2>
            <div className="form-control w-full mb-3">
              <input
                type="text"
                placeholder="Diamond ID"
                className="input input-success w-full"
                value={buyData.diamondId}
                onChange={(e) => setBuyData({ ...buyData, diamondId: e.target.value })}
              />
            </div>
            <button className="btn btn-accent w-full" onClick={() => handleBuyDiamond(buyData.diamondId)}>
              Buy Diamond
            </button>
          </div>
        </div>
      </div>
  
      {/* User Diamonds */}
      <h2 className="text-xl font-bold mt-10">Your Diamonds   <button onClick={fetchDiamonds}>Refresh</button></h2>
      <div className="grid grid-cols-3 gap-6">
        {userDiamonds.map((diamond) => (
          <div className="card w-full bg-white shadow-xl border border-gray-300" key={diamond.id}>
            <div className="card-body">
              <h3 className="text-lg font-bold">{diamond.origin}</h3>
              <p>ID: {diamond.id}</p>
              <p>Current Owner: {diamond.currentOwner}</p>
              <p>Price: {diamond.price} ETH</p>
              <p>Status: {diamond.forSale ? "For Sale" : "Not For Sale"}</p>
              <button className="btn btn-outline btn-secondary w-full mt-4" onClick={() => fetchOwnershipHistory(diamond.id)}>
                View Ownership History
              </button>
            </div>
          </div>
        ))}
      </div>
  
      {/* Ownership History */}
      {ownershipHistory.history.length > 0 && (
        <div className="mt-10 p-4 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-xl font-bold">Ownership History for Diamond ID: {ownershipHistory.diamondId}</h2>
          <ul className="list-disc pl-6">
            {ownershipHistory.history.map((owner, index) => (
              <li key={index} className="mt-1">{owner}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
  
};

export default User;
