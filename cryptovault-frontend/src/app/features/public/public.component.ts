import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Shield, TrendingUp, Lock, Globe, ChevronRight, Star, ArrowUpRight, ArrowDownRight } from 'lucide-angular';

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <!-- Navigation -->
      <nav class="fixed top-0 w-full bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <lucide-icon [name]="shield" class="w-5 h-5 text-white"></lucide-icon>
              </div>
              <span class="text-xl font-bold text-white">CryptoVault Pro</span>
            </div>
            <div class="hidden md:flex items-center space-x-8">
              <a href="#features" class="text-gray-300 hover:text-white transition">Features</a>
              <a href="#security" class="text-gray-300 hover:text-white transition">Security</a>
              <a href="#pricing" class="text-gray-300 hover:text-white transition">Pricing</a>
              <a href="#about" class="text-gray-300 hover:text-white transition">About</a>
            </div>
            <div class="flex items-center space-x-4">
              <a routerLink="/auth/login" class="text-gray-300 hover:text-white transition">Login</a>
              <a routerLink="/auth/register" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
            Secure Crypto Management
            <span class="block text-blue-400">Made Simple</span>
          </h1>
          <p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The most trusted crypto wallet platform with bank-level security, 
            instant transactions, and portfolio analytics all in one place.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a routerLink="/auth/register" 
               class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition transform hover:scale-105">
              Get Started Free
            </a>
            <a href="#features" 
               class="border border-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition">
              Learn More
            </a>
          </div>
          
          <!-- Trust Badges -->
          <div class="flex items-center justify-center space-x-8 text-gray-400">
            <div class="flex items-center space-x-2">
              <lucide-icon [name]="shield" class="w-5 h-5"></lucide-icon>
              <span>Bank-Level Security</span>
            </div>
            <div class="flex items-center space-x-2">
              <lucide-icon [name]="star" class="w-5 h-5"></lucide-icon>
              <span>4.9/5 Rating</span>
            </div>
            <div class="flex items-center space-x-2">
              <lucide-icon [name]="globe" class="w-5 h-5"></lucide-icon>
              <span>150+ Countries</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Live Market Ticker -->
      <section class="bg-slate-800/50 backdrop-blur border-y border-slate-700/50 py-4">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center space-x-8 overflow-x-auto">
            <div class="flex items-center space-x-2 whitespace-nowrap">
              <span class="text-gray-400">BTC</span>
              <span class="text-white font-semibold">$42,156</span>
              <lucide-icon [name]="arrowUpRight" class="w-4 h-4 text-green-400"></lucide-icon>
              <span class="text-green-400 text-sm">+2.5%</span>
            </div>
            <div class="flex items-center space-x-2 whitespace-nowrap">
              <span class="text-gray-400">ETH</span>
              <span class="text-white font-semibold">$2,234</span>
              <lucide-icon [name]="arrowDownRight" class="w-4 h-4 text-red-400"></lucide-icon>
              <span class="text-red-400 text-sm">-1.2%</span>
            </div>
            <div class="flex items-center space-x-2 whitespace-nowrap">
              <span class="text-gray-400">SOL</span>
              <span class="text-white font-semibold">$95.67</span>
              <lucide-icon [name]="arrowUpRight" class="w-4 h-4 text-green-400"></lucide-icon>
              <span class="text-green-400 text-sm">+5.1%</span>
            </div>
            <div class="flex items-center space-x-2 whitespace-nowrap">
              <span class="text-gray-400">USDT</span>
              <span class="text-white font-semibold">$1.00</span>
              <lucide-icon [name]="arrowUpRight" class="w-4 h-4 text-green-400"></lucide-icon>
              <span class="text-green-400 text-sm">+0.01%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Grid -->
      <section id="features" class="py-20 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p class="text-xl text-gray-300">Powerful features for modern crypto management</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition">
              <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <lucide-icon [name]="shield" class="w-6 h-6 text-blue-400"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">Secure Wallet Storage</h3>
              <p class="text-gray-400">Military-grade encryption and multi-signature technology keep your assets safe.</p>
            </div>
            
            <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition">
              <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <lucide-icon [name]="trendingUp" class="w-6 h-6 text-green-400"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">Instant Transactions</h3>
              <p class="text-gray-400">Send and receive crypto instantly with our optimized blockchain infrastructure.</p>
            </div>
            
            <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition">
              <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <lucide-icon [name]="trendingUp" class="w-6 h-6 text-purple-400"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">Portfolio Analytics</h3>
              <p class="text-gray-400">Advanced analytics and insights to track your crypto performance.</p>
            </div>
            
            <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition">
              <div class="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <lucide-icon [name]="globe" class="w-6 h-6 text-orange-400"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">Multi-Chain Support</h3>
              <p class="text-gray-400">Support for Bitcoin, Ethereum, Solana, and thousands of tokens.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Market Preview -->
      <section class="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-white mb-4">Live Market Data</h2>
            <p class="text-xl text-gray-300">Real-time prices and market insights</p>
          </div>
          
          <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-900/50">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Coin</th>
                    <th class="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                    <th class="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">24h Change</th>
                    <th class="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Market Cap</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700/50">
                  <tr class="hover:bg-slate-700/30 transition">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-orange-500 rounded-full mr-3"></div>
                        <span class="text-white font-medium">Bitcoin</span>
                        <span class="text-gray-400 ml-2">BTC</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-white">$42,156.32</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-green-400 flex items-center">
                        <lucide-icon [name]="arrowUpRight" class="w-4 h-4 mr-1"></lucide-icon>
                        +2.5%
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-300">$823.5B</td>
                  </tr>
                  <tr class="hover:bg-slate-700/30 transition">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-500 rounded-full mr-3"></div>
                        <span class="text-white font-medium">Ethereum</span>
                        <span class="text-gray-400 ml-2">ETH</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-white">$2,234.56</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-red-400 flex items-center">
                        <lucide-icon [name]="arrowDownRight" class="w-4 h-4 mr-1"></lucide-icon>
                        -1.2%
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-300">$268.2B</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- Security Section -->
      <section id="security" class="py-20 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-white mb-4">Bank-Level Security</h2>
            <p class="text-xl text-gray-300">Your assets are protected with industry-leading security measures</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <lucide-icon [name]="shield" class="w-8 h-8 text-blue-400"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">2FA Authentication</h3>
              <p class="text-gray-400">Two-factor authentication keeps your account secure</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <lucide-icon [name]="shield" class="w-8 h-8 text-green-400"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">Cold Storage</h3>
              <p class="text-gray-400">Majority of assets stored in secure cold storage</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <lucide-icon [name]="shield" class="w-8 h-8 text-purple-400"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-white mb-2">Encryption</h3>
              <p class="text-gray-400">End-to-end encryption for all transactions</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-slate-900 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div class="flex items-center space-x-2 mb-4">
                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <lucide-icon [name]="shield" class="w-5 h-5 text-white"></lucide-icon>
                </div>
                <span class="text-xl font-bold text-white">CryptoVault Pro</span>
              </div>
              <p class="text-gray-400">The most trusted crypto wallet platform</p>
            </div>
            
            <div>
              <h4 class="text-white font-semibold mb-4">Product</h4>
              <ul class="space-y-2 text-gray-400">
                <li><a href="#" class="hover:text-white transition">Features</a></li>
                <li><a href="#" class="hover:text-white transition">Security</a></li>
                <li><a href="#" class="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 class="text-white font-semibold mb-4">Company</h4>
              <ul class="space-y-2 text-gray-400">
                <li><a href="#" class="hover:text-white transition">About</a></li>
                <li><a href="#" class="hover:text-white transition">Blog</a></li>
                <li><a href="#" class="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 class="text-white font-semibold mb-4">Legal</h4>
              <ul class="space-y-2 text-gray-400">
                <li><a href="#" class="hover:text-white transition">Privacy</a></li>
                <li><a href="#" class="hover:text-white transition">Terms</a></li>
                <li><a href="#" class="hover:text-white transition">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div class="border-t border-slate-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 CryptoVault Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class PublicComponent {
  shield = Shield;
  trendingUp = TrendingUp;
  lock = Lock;
  globe = Globe;
  chevronRight = ChevronRight;
  star = Star;
  arrowUpRight = ArrowUpRight;
  arrowDownRight = ArrowDownRight;
}
