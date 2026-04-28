import Web3 from 'web3';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import * as bip39 from 'bip39';

const ECPair = ECPairFactory(ecc);

export interface WalletData {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

export interface BalanceResponse {
  balance: string;
  usdValue: number;
  lastUpdated: Date;
}

export interface TransactionRequest {
  fromAddress: string;
  toAddress: string;
  amount: string;
  privateKey: string;
  feeLevel?: 'low' | 'medium' | 'high';
}

export interface TransactionResponse {
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  fee: string;
  estimatedTime?: string;
}

export interface PriceData {
  usd: number;
  change_24h: number;
}

class BlockchainService {
  private web3: Web3;
  private solanaConnection: Connection;
  private readonly encryptionKey = process.env['ENCRYPTION_KEY'] || 'default-encryption-key';

  constructor() {
    // Initialize Web3 for Ethereum
    this.web3 = new Web3(process.env['ETH_NODE_URL'] || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY');
    
    // Initialize Solana connection
    this.solanaConnection = new Connection(
      process.env['SOL_RPC_URL'] || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );
  }

  // ==================== ENCRYPTION ====================
  
  encryptPrivateKey(privateKey: string): string {
    return CryptoJS.AES.encrypt(privateKey, this.encryptionKey).toString();
  }

  decryptPrivateKey(encryptedKey: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // ==================== ETHEREUM ====================
  
  async createEthereumWallet(): Promise<WalletData> {
    const account = this.web3.eth.accounts.create();
    return {
      address: account.address,
      privateKey: account.privateKey,
      mnemonic: (account.mnemonic as any)?.phrase
    };
  }

  async getEthereumBalance(address: string): Promise<BalanceResponse> {
    try {
      const balanceWei = await this.web3.eth.getBalance(address);
      const balanceEth = this.web3.utils.fromWei(balanceWei, 'ether');
      const price = await this.getPrice('ETH');
      
      return {
        balance: balanceEth,
        usdValue: parseFloat(balanceEth) * price.usd,
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to get ETH balance: ${error}`);
    }
  }

  async sendEthereum(request: TransactionRequest): Promise<TransactionResponse> {
    try {
      const account = this.web3.eth.accounts.privateKeyToAccount(request.privateKey);
      const nonce = await this.web3.eth.getTransactionCount(account.address);
      
      const gasPrice = await this.web3.eth.getGasPrice();
      const gasLimit = 21000; // Standard ETH transfer
      
      const tx = {
        from: request.fromAddress,
        to: request.toAddress,
        value: this.web3.utils.toWei(request.amount, 'ether'),
        gas: gasLimit,
        gasPrice: gasPrice,
        nonce: nonce
      };

      const signedTx = await this.web3.eth.accounts.signTransaction(tx, request.privateKey);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      return {
        txHash: receipt.transactionHash as string,
        status: 'pending',
        fee: this.web3.utils.fromWei((gasPrice * BigInt(gasLimit)).toString(), 'ether'),
        estimatedTime: '~2 minutes'
      };
    } catch (error) {
      throw new Error(`Failed to send ETH: ${error}`);
    }
  }

  // ==================== BITCOIN ====================
  
  async createBitcoinWallet(): Promise<WalletData> {
    const keyPair = ECPair.makeRandom();
    const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
    
    return {
      address: address!,
      privateKey: keyPair.privateKey.toString(),
      mnemonic: bip39.generateMnemonic()
    };
  }

  async getBitcoinBalance(address: string): Promise<BalanceResponse> {
    try {
      const response = await axios.get(`${process.env['BTC_API_URL']}/address/${address}`);
      const balanceSatoshi = response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum;
      const balanceBtc = balanceSatoshi / 100000000;
      const price = await this.getPrice('BTC');
      
      return {
        balance: balanceBtc.toString(),
        usdValue: balanceBtc * price.usd,
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to get BTC balance: ${error}`);
    }
  }

  async sendBitcoin(request: TransactionRequest): Promise<TransactionResponse> {
    try {
      const keyPair = ECPair.fromPrivateKey(Buffer.from(request.privateKey, 'hex'));
      const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
      
      // Get UTXOs (simplified - in production, you'd use a proper UTXO management system)
      const utxos = await this.getUtxos(address!);
      
      // Build transaction
      const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin });
      
      let totalInput = 0;
      for (const utxo of utxos) {
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          nonWitnessUtxo: utxo.txHex
        });
        totalInput += utxo.value;
      }
      
      const amount = parseFloat(request.amount) * 100000000; // Convert to satoshis
      const fee = 1000; // Simplified fee calculation
      const change = totalInput - amount - fee;
      
      psbt.addOutput({
        address: request.toAddress,
        value: BigInt(amount)
      });
      
      if (change > 0) {
        psbt.addOutput({
          address: address!,
          value: BigInt(change)
        });
      }
      
      // Sign and finalize
      utxos.forEach((_, index) => {
        psbt.signInput(index, keyPair);
      });
      
      psbt.finalizeAllInputs();
      const tx = psbt.extractTransaction();
      
      // Broadcast transaction
      await axios.post(`${process.env['BTC_API_URL']}/tx`, tx.toHex());
      
      return {
        txHash: tx.getId(),
        status: 'pending',
        fee: (fee / 100000000).toString(),
        estimatedTime: '~10 minutes'
      };
    } catch (error) {
      throw new Error(`Failed to send BTC: ${error}`);
    }
  }

  private async getUtxos(address: string): Promise<any[]> {
    // Simplified UTXO fetching - in production, implement proper UTXO management
    const response = await axios.get(`${process.env['BTC_API_URL']}/address/${address}/utxo`);
    return response.data.map((utxo: any) => ({
      txid: utxo.txid,
      vout: utxo.vout,
      value: BigInt(utxo.value),
      txHex: null // You'd need to fetch the full transaction
    }));
  }

  // ==================== SOLANA ====================
  
  async createSolanaWallet(): Promise<WalletData> {
    const keypair = Keypair.generate();
    return {
      address: keypair.publicKey.toBase58(),
      privateKey: Buffer.from(keypair.secretKey).toString('hex'),
      mnemonic: bip39.generateMnemonic() // Note: Solana uses different mnemonic derivation
    };
  }

  async getSolanaBalance(address: string): Promise<BalanceResponse> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.solanaConnection.getBalance(publicKey);
      const balanceSol = balance / LAMPORTS_PER_SOL;
      const price = await this.getPrice('SOL');
      
      return {
        balance: balanceSol.toString(),
        usdValue: balanceSol * price.usd,
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to get SOL balance: ${error}`);
    }
  }

  async sendSolana(request: TransactionRequest): Promise<TransactionResponse> {
    try {
      const fromKeypair = Keypair.fromSecretKey(Buffer.from(request.privateKey, 'hex'));
      const toPublicKey = new PublicKey(request.toAddress);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports: parseFloat(request.amount) * LAMPORTS_PER_SOL
        })
      );
      
      const signature = await this.solanaConnection.sendTransaction(transaction, [fromKeypair]);
      
      return {
        txHash: signature,
        status: 'pending',
        fee: '0.000005', // SOL transaction fee
        estimatedTime: '~15 seconds'
      };
    } catch (error) {
      throw new Error(`Failed to send SOL: ${error}`);
    }
  }

  // ==================== USDT (Ethereum) ====================
  
  async getUSDTBalance(address: string): Promise<BalanceResponse> {
    try {
      // USDT contract address on Ethereum mainnet
      const usdtContractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      
      const usdtAbi = [
        {
          constant: true,
          inputs: [{ name: '_owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: 'balance', type: 'uint256' }],
          type: 'function'
        }
      ];
      
      const contract = new this.web3.eth.Contract(usdtAbi as any, usdtContractAddress);
      const balance = await (contract.methods as any)['balanceOf'](address).call();
      const balanceUSDT = parseFloat(balance as string) / 1000000; // USDT has 6 decimals
      
      return {
        balance: balanceUSDT.toString(),
        usdValue: balanceUSDT, // USDT is pegged to USD
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to get USDT balance: ${error}`);
    }
  }

  async sendUSDT(request: TransactionRequest): Promise<TransactionResponse> {
    try {
      const usdtContractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
      
      const usdtAbi = [
        {
          constant: false,
          inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' }
          ],
          name: 'transfer',
          outputs: [{ name: '', type: 'bool' }],
          type: 'function'
        }
      ];
      
      const contract = new this.web3.eth.Contract(usdtAbi as any, usdtContractAddress);
      const account = this.web3.eth.accounts.privateKeyToAccount(request.privateKey);
      const nonce = await this.web3.eth.getTransactionCount(account.address);
      
      const amount = (parseFloat(request.amount) * 1000000).toString(); // USDT has 6 decimals
      
      const tx = (contract.methods as any)['transfer'](request.toAddress, amount);
      
      const gas = await tx.estimateGas({ from: account.address });
      const gasPrice = await this.web3.eth.getGasPrice();
      
      const rawTx = {
        from: account.address,
        to: usdtContractAddress,
        data: tx.encodeABI(),
        gas: gas,
        gasPrice: gasPrice,
        nonce: nonce
      };
      
      const signedTx = await this.web3.eth.accounts.signTransaction(rawTx, request.privateKey);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      return {
        txHash: receipt.transactionHash as string,
        status: 'pending',
        fee: this.web3.utils.fromWei((gasPrice * BigInt(gas)).toString(), 'ether'),
        estimatedTime: '~2 minutes'
      };
    } catch (error) {
      throw new Error(`Failed to send USDT: ${error}`);
    }
  }

  // ==================== PRICE FEED ====================
  
  async getPrice(symbol: string): Promise<PriceData> {
    try {
      // Using CoinGecko API (free tier)
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`
      );
      
      const data = response.data[symbol.toLowerCase()];
      return {
        usd: data.usd,
        change_24h: data.usd_24h_change || 0
      };
    } catch (error) {
      // Fallback prices for development
      const fallbackPrices: { [key: string]: PriceData } = {
        'btc': { usd: 42000, change_24h: 2.5 },
        'eth': { usd: 2300, change_24h: -1.2 },
        'sol': { usd: 95, change_24h: 5.1 },
        'usdt': { usd: 1.00, change_24h: 0.01 }
      };
      
      return fallbackPrices[symbol.toLowerCase()] || { usd: 0, change_24h: 0 };
    }
  }

  async getAllPrices(): Promise<{ [key: string]: PriceData }> {
    const symbols = ['BTC', 'ETH', 'SOL', 'USDT'];
    const prices: { [key: string]: PriceData } = {};
    
    for (const symbol of symbols) {
      try {
        prices[symbol] = await this.getPrice(symbol);
      } catch (error) {
        console.error(`Failed to get price for ${symbol}:`, error);
      }
    }
    
    return prices;
  }

  // ==================== VALIDATION ====================
  
  validateAddress(address: string, coinType: string): boolean {
    try {
      switch (coinType.toUpperCase()) {
        case 'ETH':
        case 'USDT':
          return this.web3.utils.isAddress(address);
        case 'BTC':
          bitcoin.address.toOutputScript(address, bitcoin.networks.bitcoin);
          return true;
        case 'SOL':
          new PublicKey(address);
          return true;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  validatePrivateKey(privateKey: string, coinType: string): boolean {
    try {
      switch (coinType.toUpperCase()) {
        case 'ETH':
        case 'USDT':
          this.web3.eth.accounts.privateKeyToAccount(privateKey);
          return true;
        case 'BTC':
          ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'));
          return true;
        case 'SOL':
          Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));
          return true;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }
}

export default new BlockchainService();
