import React, { useState, createContext } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";

const NFTContext = createContext();

export const NFTContextProvider = ({ children }) => {
  const [fileURL, setFileURL] = useState(null);

  // When we change the image for NFT execute this function to recreate the File URL
  const onChangeFile = async (e) => {
    var file = e.target.files[0];
    console.log(file);

    try {
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        console.log("Uploaded image to Pinata: ", response.pinataURL);
        setFileURL(response.pinataURL);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  // Uploade Metadata to IPFS we can execute this function when user minting the NFT
  const uploadMetadatToIPFS = async () => {
    const { name, description, price } = formParams;

    if (!name || !description || !price || !fileURL) return;

    const nftJSON = {
      name,
      description,
      price,
      image: fileURL,
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Uploaded JSON to Pinata: ", response);
        return response.pinataURL;
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  return <NFTContext.Provider value={{}}>{children}</NFTContext.Provider>;
};
