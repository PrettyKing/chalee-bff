// import { InfoContract, InfoContract__factory } from '@/types/ethers-contracts';
import LogChainABI from '@abis/LogChain.json';
import { BrowserProvider } from 'ethers';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    ethereum?: any;
  }
}
const CONTRACT_ADDRESS = LogChainABI.CONTRACT_ADDRESS;
console.log('🌺🌺🌺🌺🌺🌺🌺🌺🌺 ', CONTRACT_ADDRESS);
const DappPage = () => {
//   const [contract, setContract] = useState<InfoContract | null>(null);

//   useEffect(() => {
//     const provider = new BrowserProvider(window.ethereum);
//     provider
//       .getSigner()
//       .then(signer => {
//         const contractInstance = InfoContract__factory.connect(CONTRACT_ADDRESS, signer);
//         setContract(contractInstance);
//       })
//       .catch(error => {
//         console.error('Error connecting to contract:', error);
//       });
//   }, []);
//   useEffect(() => {
//     if (contract) {
//       contract.setInfo('Hello, DappTest!', 2);
//     }
//   }, [contract]);

  return (
    <>
      <h1>test page</h1>
    </>
  );
};
export default DappPage;
