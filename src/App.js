import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from 'ethers';
import contractABI from './utils/voxiesABI.json';

// Constants
const TWITTER_HANDLE = 'ptisserand';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const VOXIES_CONTRACT_ADDR = "0xE3435EdBf54b5126E817363900234AdFee5B3cee";
const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID;
const TESTING_ADDRESS = '0x56879cc88fa3895C082C22035dB1386DcAc53bba';
// 0xAB400BE87F78665B4d571a141AC13A4bded2e37C


const App = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [nftIds, setNftIds] = useState([]);
  const [nftMetadatas, setNftMetadatas] = useState([]);
  const [baseUri, setBaseUri] = useState('');

  const [errorAddressMsg, setErrorAddressMsg] = useState('');
  const [tmpAddress, setTmpAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const provider = new ethers.providers.InfuraProvider(null, INFURA_PROJECT_ID);
  const contract = new ethers.Contract(VOXIES_CONTRACT_ADDR, contractABI.abi, provider);

  const fetchNftIds = async () => {
    if (!walletAddress) { return; }
    console.log("Fetching NFTs for", walletAddress);
    let uri = await contract.baseURI();
    let result = await contract.tokensOfOwner(walletAddress);
    let ids = Array.from(result, r => r.toNumber());
    ids.sort((a, b) => a - b);
    console.log("Nb of NFTs:", ids.length);
    // console.log("Base URI:", uri);
    setBaseUri(uri);
    setNftIds(ids);
  }

  const checkAddress = async () => {
    if (!ethers.utils.isAddress(tmpAddress)) {
      setErrorAddressMsg('Invalid address');
    } else {
      setErrorAddressMsg('');
      if (tmpAddress !== walletAddress) {
        setNftMetadatas([])
      }
      setWalletAddress(tmpAddress);
      setTmpAddress('');
    }
  }

  const fetchNftMetadata = async (id) => {
    const uri = baseUri + '' + id;
    try {
      const response = await fetch(uri);
      const metadata = await response.json();
      return metadata;
    } catch (error) {
      console.log(uri, ":", error);
    }
  }

  const fetchNftsMetadata = async () => {
    const metadatas = await Promise.all(nftIds.map(async (id, index) => {
      const metadata = await fetchNftMetadata(id);
      return {
        id: id,
        image: metadata.image,
        animation_url: metadata.animation_url,
        attributes: metadata.attributes,
      }
    }));
    setNftMetadatas(metadatas);
  }

  const renderNftAttributes = (attributes) => {
    return (
      <div className="nft-attributes">

        {attributes.map((attribute, index) => {
          return (
            <div className="nft-attribute">
              <div className="nft-attribute-type">
                {attribute.trait_type}
              </div>
              <div className="nft-attribute-value">
                {attribute.value}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderNfts = () => {
    console.log("renderNfts");
    if (nftIds.length > 0) {
      return (
        <div className="nft-container">
          <div className="nft-list">
            {nftMetadatas.map((metadata, index) => {

              return (
                <div className="nft-item" key={index}>
                  <div className="nft-col">
                    <img src={metadata.image} alt={"nft-" + metadata.id} width="500" height="500" />
                    {renderNftAttributes(metadata.attributes)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    } else {
      return (
        <div>No NFTS!</div>
      )
    }
  }

  useEffect(() => {
    fetchNftIds();
  }, [walletAddress]);

  useEffect(() => {
    fetchNftsMetadata();
  }, [nftIds]);

  return (
    <div className="App">
      <div className="header-container">
        <header>
          <div className="left">
            <p className="title"><a style={{ textDecoration: 'none', color: 'white' }} href="https://voxies.io">Voxies</a></p>
          </div>
        </header>
      </div>
      <div className="form-container">
        <div className="first-row">
          <input type="text"
            value={tmpAddress}
            placeholder='0xaabbccddee...'
            onChange={e => setTmpAddress(e.target.value)} />
        </div>
        <div className="second-row">
          <span>{errorAddressMsg}</span>
        </div>
        <div className='button-container'>
          <button className='cta-button nft-button' disabled={loading} onClick={checkAddress}>
            Retrieve NFTs
          </button>
        </div>
      </div>
      {walletAddress !== '' && renderNfts()}
      <div className="footer-container">
        <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
        <a
          className="footer-text"
          href={TWITTER_LINK}
          target="_blank"
          rel="noreferrer"
        >{`build by @${TWITTER_HANDLE}`}</a>

      </div>
    </div>
  );
}

export default App;
