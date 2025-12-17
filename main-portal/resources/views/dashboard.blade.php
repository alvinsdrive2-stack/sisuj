<x-app-layout>
    <!-- Include UI Components -->
    <x-ui.alert />

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            SSO Dashboard - LSP Gatensi
        </h2>
    </x-slot>

    <!-- Floating Loading Modal -->
    <div id="floatingLoadingModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden" style="z-index: 9999;">
        <div class="fixed inset-0 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 transform">
                <!-- Logo with spinning ring -->
                <div class="flex flex-col items-center mb-6">
                    <div class="relative inline-block mb-4">
                        <!-- Outer spinning ring -->
                        <div class="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <!-- Favicon in center -->
                        <div class="absolute inset-0 flex items-center justify-center">
                            <img src="{{ asset('favicon.png') }}" alt="Loading..." class="w-10 h-10">
                        </div>
                    </div>
                </div>

                <!-- Loading text -->
                <div class="text-center">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        Menghubungkan ke <span id="loadingSystemName"></span>...
                    </h3>
                    <p class="text-sm text-gray-600 mb-4">
                        Mohon tunggu sebentar
                    </p>

                    <!-- Progress bar -->
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div id="loadingProgressBar" class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                             style="width: 0%">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Account Selection Modal -->
    <div id="accountSelectionModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden" style="z-index: 9999;">
        <div class="fixed inset-0 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 transform p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-semibold text-gray-900">Pilih Akun</h3>
                    <button onclick="closeAccountModal()" class="text-gray-400 hover:text-gray-500 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div id="accountModalMessage" class="mb-6 text-sm text-gray-600"></div>

                <div id="accountOptions" class="space-y-3 max-h-96 overflow-y-auto">
                    <!-- Account options will be loaded here -->
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                    <button onclick="closeAccountModal()"
                            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                        Batal
                    </button>
                    <button id="confirmAccountBtn"
                            onclick="confirmAccountSelection()"
                            disabled
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Lanjutkan
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Dashboard Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:mx-auto 2xl:max-w-screen-2xl py-12">
        <!-- Professional Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-6 mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Dashboard SSO Portal</h1>
                    <p class="text-gray-600 mt-1">Selamat datang, {{ Auth::user()->name }} • {{ now()->format('d M Y') }}</p>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-right">
                        <p class="text-sm text-gray-500">Status</p>
                        <div class="flex items-center space-x-2">
                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-sm font-medium text-gray-900">{{ ucfirst(Auth::user()->role ?? 'user') }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Key Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <i class="fas fa-th text-blue-600"></i>
                    </div>
                    <span class="text-xs text-gray-500 uppercase">Total</span>
                </div>
                <h3 class="text-2xl font-semibold text-gray-900">4</h3>
                <p class="text-sm text-gray-600">Sistem Aktif</p>
            </div>

            <div class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <i class="fas fa-users text-emerald-600"></i>
                    </div>
                    <span class="text-xs text-gray-500 uppercase">Bulan Ini</span>
                </div>
                <h3 class="text-2xl font-semibold text-gray-900">1,234</h3>
                <p class="text-sm text-gray-600">Pengguna</p>
            </div>

            <div class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <i class="fas fa-sign-in-alt text-purple-600"></i>
                    </div>
                    <span class="text-xs text-gray-500 uppercase">Hari Ini</span>
                </div>
                <h3 class="text-2xl font-semibold text-gray-900">856</h3>
                <p class="text-sm text-gray-600">Login</p>
            </div>

            <div class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                        <i class="fas fa-server text-amber-600"></i>
                    </div>
                    <span class="text-xs text-gray-500 uppercase">Uptime</span>
                </div>
                <h3 class="text-2xl font-semibold text-gray-900">99.9%</h3>
                <p class="text-sm text-gray-600">Server</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <!-- System Access Chart -->
            <div class="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">Statistik Akses Sistem</h3>
                        <p class="text-sm text-gray-600">7 hari terakhir</p>
                    </div>
                    <select class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>7 Hari</option>
                        <option>30 Hari</option>
                        <option>3 Bulan</option>
                    </select>
                </div>

                <!-- Simple Chart Representation -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-4 h-4 bg-blue-500 rounded"></div>
                            <span class="text-sm font-medium">Sistem FG</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-48 bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full" style="width: 75%"></div>
                            </div>
                            <span class="text-sm font-medium">1,245</span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-4 h-4 bg-green-500 rounded"></div>
                            <span class="text-sm font-medium">Sistem Reguler</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-48 bg-gray-200 rounded-full h-2">
                                <div class="bg-green-500 h-2 rounded-full" style="width: 60%"></div>
                            </div>
                            <span class="text-sm font-medium">996</span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-4 h-4 bg-purple-500 rounded"></div>
                            <span class="text-sm font-medium">Sistem Balai</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-48 bg-gray-200 rounded-full h-2">
                                <div class="bg-purple-500 h-2 rounded-full" style="width: 85%"></div>
                            </div>
                            <span class="text-sm font-medium">1,410</span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-4 h-4 bg-amber-500 rounded"></div>
                            <span class="text-sm font-medium">Sistem TUK</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <div class="w-48 bg-gray-200 rounded-full h-2">
                                <div class="bg-amber-500 h-2 rounded-full" style="width: 45%"></div>
                            </div>
                            <span class="text-sm font-medium">747</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- User Activity Chart -->
            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">Grafik Aktivitas Pengguna</h3>
                        <p class="text-sm text-gray-600">Login harian 7 hari terakhir</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs text-gray-500">Total:</span>
                        <span class="text-sm font-bold text-blue-600">4,398</span>
                    </div>
                </div>

                <!-- Bar Chart -->
                <div class="space-y-3">
                    <div class="flex items-end justify-between">
                        <div class="flex items-center space-x-3 w-16">
                            <span class="text-xs font-medium text-gray-600">Sen</span>
                        </div>
                        <div class="flex-1 relative">
                            <div class="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500" style="width: 85%">
                                    <span class="text-xs font-medium text-white">623</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-end justify-between">
                        <div class="flex items-center space-x-3 w-16">
                            <span class="text-xs font-medium text-gray-600">Sel</span>
                        </div>
                        <div class="flex-1 relative">
                            <div class="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500" style="width: 72%">
                                    <span class="text-xs font-medium text-white">528</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-end justify-between">
                        <div class="flex items-center space-x-3 w-16">
                            <span class="text-xs font-medium text-gray-600">Rab</span>
                        </div>
                        <div class="flex-1 relative">
                            <div class="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div class="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500" style="width: 90%">
                                    <span class="text-xs font-medium text-white">659</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-end justify-between">
                        <div class="flex items-center space-x-3 w-16">
                            <span class="text-xs font-medium text-gray-600">Kam</span>
                        </div>
                        <div class="flex-1 relative">
                            <div class="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div class="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500" style="width: 68%">
                                    <span class="text-xs font-medium text-white">498</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-end justify-between">
                        <div class="flex items-center space-x-3 w-16">
                            <span class="text-xs font-medium text-gray-600">Jum</span>
                        </div>
                        <div class="flex-1 relative">
                            <div class="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500" style="width: 78%">
                                    <span class="text-xs font-medium text-white">571</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-end justify-between">
                        <div class="flex items-center space-x-3 w-16">
                            <span class="text-xs font-medium text-gray-600">Sab</span>
                        </div>
                        <div class="flex-1 relative">
                            <div class="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500" style="width: 45%">
                                    <span class="text-xs font-medium text-white">329</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-end justify-between">
                        <div class="flex items-center space-x-3 w-16">
                            <span class="text-xs font-medium text-gray-600">Min</span>
                        </div>
                        <div class="flex-1 relative">
                            <div class="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                <div class="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500" style="width: 38%">
                                    <span class="text-xs font-medium text-white">278</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chart Summary -->
                <div class="mt-6 pt-4 border-t border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span class="text-xs text-gray-600">Rata-rata: 628/hari</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                <span class="text-xs text-gray-600">Peak: Rab (659)</span>
                            </div>
                        </div>
                        <div class="text-xs text-emerald-600 font-medium">
                            <i class="fas fa-arrow-up mr-1"></i>+15% minggu lalu
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- System Access Grid -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="px-6 py-4 border-b border-gray-100">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">Portal Sistem Terintegrasi</h3>
                        <p class="text-sm text-gray-600">Akses terpusat untuk semua sistem LSP Gatensi</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span class="text-sm font-medium text-emerald-700">4 Online</span>
                    </div>
                </div>
            </div>

            <div class="p-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    @foreach(app(\App\Services\SSOService::class)->getAvailableSystems() as $key => $system)
                    <button onclick="accessSystem('{{ $key }}')" class="group text-left w-full">
                        <div class="bg-gray-50 hover:bg-white hover:border-gray-200 border border-gray-100 rounded-lg p-4 transition-all duration-200 hover:shadow-sm">
                            <div class="flex items-start space-x-3">
                                <div class="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    <img src="{{ asset('favicon.png') }}" alt="{{ $system['name'] }}" class="w-8 h-8 object-contain">
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="font-semibold text-gray-900 text-sm mb-1">{{ $system['name'] }}</h4>
                                    <p class="text-xs text-gray-600 mb-2 truncate">{{ $system['description'] }}</p>
                                    <div class="flex items-center text-xs text-gray-500">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 mr-2">
                                            <div class="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                                            Aktif
                                        </span>
                                        <span>24/7</span>
                                    </div>
                                </div>
                                <i class="fas fa-chevron-right text-gray-400 text-xs group-hover:text-gray-600 transition-colors"></i>
                            </div>
                        </div>
                    </button>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    <style>
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out;
        }

        .group:hover .group-hover\:-translate-y-1 {
            transform: translateY(-4px);
        }

        .group:hover .group-hover\:translate-x-1 {
            transform: translateX(4px);
        }

        .group:hover .group-hover\:scale-110 {
            transform: scale(1.1);
        }

        .group:hover .group-hover\:opacity-75 {
            opacity: 0.75;
        }

        @keyframes shimmer {
            0% {
                background-position: -200px 0;
            }
            100% {
                background-position: calc(200px + 100%) 0;
            }
        }

        .shimmer {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200px 100%;
            animation: shimmer 1.5s infinite;
        }
    </style>

    <script>
        let selectedSystem = null;
        let selectedAccount = null;

        // Add animation on page load
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.bg-white.rounded-xl');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.5s ease-out';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        });

        function accessSystem(system) {
            selectedSystem = system;
            selectedAccount = null;

            // Check for multiple accounts via AJAX
            fetch(`/redirect-to-system?system=${system}&ajax=1`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'multiple_matches') {
                        showAccountSelectionModal(data);
                    } else if (data.redirect_url) {
                        showFloatingLoading(getSystemName(selectedSystem), data.redirect_url);
                    } else {
                        showAlert('Terjadi kesalahan: ' + (data.message || 'Unknown error'), 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showAlert('Gagal menghubungkan ke sistem. Silakan coba lagi.', 'error');
                });
        }

        function getSystemName(system) {
            const systems = {
                'balai': 'Sistem Balai',
                'reguler': 'Sistem Reguler',
                'suisei': 'Sistem FG/Suisei',
                'tuk': 'Sistem TUK'
            };
            return systems[system] || system;
        }

        function showAccountSelectionModal(data) {
            document.getElementById('accountModalMessage').innerHTML = `
                <p><strong>${data.count}</strong> akun dengan nama mirip ditemukan di <strong>${getSystemName(selectedSystem)}</strong>.</p>
                <p class="mt-1">Pilih akun yang ingin digunakan:</p>
            `;

            const accountOptions = document.getElementById('accountOptions');
            accountOptions.innerHTML = '';

            data.matches.forEach((account, index) => {
                const accountDiv = document.createElement('div');
                accountDiv.className = 'flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer account-option';
                accountDiv.onclick = () => selectAccount(account, accountDiv);

                accountDiv.innerHTML = `
                    <input type="radio" name="account" value="${account.id}" class="mr-3">
                    <div class="flex items-center flex-1">
                        <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span class="text-sm font-medium text-blue-600">${account.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div class="flex-1">
                            <p class="font-medium text-gray-900">${account.name}</p>
                            <p class="text-sm text-gray-500">${account.email}</p>
                        </div>
                        <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            ${account.role || 'user'}
                        </span>
                    </div>
                `;

                accountOptions.appendChild(accountDiv);
            });

            document.getElementById('accountSelectionModal').classList.remove('hidden');
        }

        function selectAccount(account, element) {
            selectedAccount = account;

            // Update visual state
            document.querySelectorAll('.account-option').forEach(opt => {
                opt.classList.remove('bg-blue-50', 'border-blue-500');
            });
            element.classList.add('bg-blue-50', 'border-blue-500');

            // Enable confirm button
            document.getElementById('confirmAccountBtn').disabled = false;
        }

        function closeAccountModal() {
            document.getElementById('accountSelectionModal').classList.add('hidden');
            selectedSystem = null;
            selectedAccount = null;
        }

        function confirmAccountSelection() {
            if (!selectedAccount) {
                showAlert('Silakan pilih akun terlebih dahulu', 'warning');
                return;
            }

            // Show loading
            document.getElementById('confirmAccountBtn').disabled = true;
            document.getElementById('confirmAccountBtn').textContent = 'Menghubungkan...';

            const formData = new FormData();
            formData.append('sso_user_id', '{{ Auth::user()->id }}');
            formData.append('system_name', selectedSystem);
            formData.append('selected_user_id', selectedAccount.id);
            formData.append('selected_user_email', selectedAccount.email);
            formData.append('selected_user_name', selectedAccount.name);
            formData.append('selected_user_role', selectedAccount.role);

            fetch('/admin/user-mapping/select-account', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    closeAccountModal();
                    showFloatingLoading(getSystemName(selectedSystem), data.redirect_url);
                } else {
                    showAlert('Error: ' + data.message, 'error');
                    document.getElementById('confirmAccountBtn').disabled = false;
                    document.getElementById('confirmAccountBtn').textContent = 'Lanjutkan';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Terjadi kesalahan. Silakan coba lagi.', 'error');
                document.getElementById('confirmAccountBtn').disabled = false;
                document.getElementById('confirmAccountBtn').textContent = 'Lanjutkan';
            });
        }

        // Floating Loading Modal
        function showFloatingLoading(systemName, redirectUrl) {
            document.getElementById('loadingSystemName').textContent = systemName;

            // Show loading modal
            const modal = document.getElementById('floatingLoadingModal');
            modal.classList.remove('hidden');

            // Animate progress bar
            const progressBar = document.getElementById('loadingProgressBar');

            setTimeout(() => {
                progressBar.style.width = '50%';
            }, 500);

            setTimeout(() => {
                progressBar.style.width = '100%';
            }, 1500);

            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);
        }
    </script>
</x-app-layout>