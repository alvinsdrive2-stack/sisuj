<x-app-layout>
    <!-- Include UI Components -->
    <x-ui.alert />

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            SSO Dashboard - LSP Gatensi
        </h2>
    </x-slot>

    <!-- Floating Loading Modal -->
    <div id="floatingLoadingModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
        <div class="flex items-center justify-center min-h-screen">
            <div class="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 transform transition-all">
                <!-- Logo with animation -->
                <div class="flex flex-col items-center mb-6">
                    <div class="relative mb-4">
                        <img src="{{ asset('logo2.png') }}"
                             alt="LSP Gatensi Logo"
                             class="w-20 h-20 animate-spin-slow rounded-full shadow-lg">

                        <!-- Pulsing ring -->
                        <div class="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping"></div>

                        <!-- Status indicator -->
                        <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <svg class="w-3 h-3 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                    </div>

                    <!-- Loading dots -->
                    <div class="flex space-x-1 mb-4">
                        <div class="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
                        <div class="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
                        <div class="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
                    </div>
                </div>

                <!-- Loading text -->
                <div class="text-center">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        Menghubungkan ke <span id="loadingSystemName"></span>...
                    </h3>
                    <p class="text-sm text-gray-600 mb-4">
                        Mohon tunggu, kami sedang mengamankan koneksi Anda
                    </p>

                    <!-- Mini progress bar -->
                    <div class="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                        <div id="loadingProgressBar" class="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                             style="width: 0%">
                            <div class="h-full bg-white opacity-30 animate-pulse"></div>
                        </div>
                    </div>

                    <!-- Status messages -->
                    <div class="space-y-1 text-xs text-gray-600" id="loadingStatus">
                        <div class="flex items-center justify-center opacity-100">
                            <svg class="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                            Token SSO dibuat
                        </div>
                        <div class="flex items-center justify-center opacity-50">
                            <div class="w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin mr-1"></div>
                            Memverifikasi...
                        </div>
                        <div class="flex items-center justify-center opacity-50">
                            <svg class="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                            </svg>
                            Mengarahkan...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Account Selection Modal -->
    <div id="accountSelectionModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <!-- Modal content -->
            <div class="mt-3">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">
                        Pilih Akun
                    </h3>
                    <button onclick="closeAccountModal()" class="text-gray-400 hover:text-gray-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div id="accountModalMessage" class="mb-4 text-sm text-gray-600"></div>

                <div id="accountOptions" class="space-y-3 max-h-96 overflow-y-auto">
                    <!-- Account options will be loaded here -->
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                    <button onclick="closeAccountModal()"
                            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                        Batal
                    </button>
                    <button id="confirmAccountBtn"
                            onclick="confirmAccountSelection()"
                            disabled
                            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        Lanjutkan
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <!-- Welcome Section -->
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                <div class="p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">
                        Selamat datang, {{ Auth::user()->name }}!
                    </h3>
                    <div class="flex items-center gap-2 text-sm">
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                            {{ ucfirst(Auth::user()->role ?? 'user') }}
                        </span>
                    </div>
                    <p class="text-gray-600 mt-2">
                        Pilih sistem yang ingin Anda akses dari portal SSO LSP Gatensi:
                    </p>

                    @if(Auth::user()->role === 'admin' || Auth::user()->role === 'super_admin')
                    <div class="mt-4">
                        <p class="text-sm text-gray-600">
                            <i class="fas fa-info-circle mr-1"></i>
                            <strong>Tip:</strong> Admin features are available in the navigation menu above
                        </p>
                    </div>
                    @endif
                </div>
            </div>

            <!-- Systems Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @foreach(app(\App\Services\SSOService::class)->getAvailableSystems() as $key => $system)
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-md transition-shadow">
                    <div class="p-6">
                        <h4 class="text-lg font-medium text-gray-900 mb-2">
                            {{ $system['name'] }}
                        </h4>
                        <p class="text-sm text-gray-600 mb-4">
                            {{ $system['description'] }}
                        </p>
                        <button onclick="accessSystem('{{ $key }}')"
                           class="system-btn inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span class="btn-text">Buka {{ $system['name'] }}</span>
                        </button>
                    </div>
                </div>
                @endforeach
            </div>

            <!-- Logout Section -->
            <div class="mt-8 bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 border-t border-gray-200">
                    <form action="{{ route('logout') }}" method="POST" class="inline">
                        @csrf
                        <button type="submit" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout dari SSO
                        </button>
                    </form>
                </div>
            </div>

            <!-- Info Section -->
            <div class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-green-800">SSO Aktif</h3>
                        <div class="mt-2 text-sm text-green-700">
                            <p>Klik tombol sistem di bawah untuk langsung masuk tanpa password lagi.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let selectedSystem = null;
        let selectedAccount = null;

        function accessSystem(system) {
            selectedSystem = system;
            selectedAccount = null;

            // Show loading state on button
            const buttons = document.querySelectorAll('.system-btn');
            buttons.forEach(btn => {
                if (btn.onclick.toString().includes(system)) {
                    btn.disabled = true;
                    btn.querySelector('.btn-text').textContent = 'Menghubungkan...';
                }
            });

            // Check for multiple accounts via AJAX
            fetch(`/redirect-to-system?system=${system}&ajax=1`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    // Reset button state
                    buttons.forEach(btn => {
                        if (btn.onclick.toString().includes(system)) {
                            btn.disabled = false;
                            btn.querySelector('.btn-text').textContent = `Buka ${getSystemName(system)}`;
                        }
                    });

                    if (data.status === 'multiple_matches') {
                        showAccountSelectionModal(data);
                    } else if (data.redirect_url) {
                        // Show floating loading modal then redirect
                        showFloatingLoading(getSystemName(selectedSystem), data.redirect_url);
                    } else {
                        showAlert('Terjadi kesalahan: ' + (data.message || 'Unknown error'), 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Reset button state
                    buttons.forEach(btn => {
                        if (btn.onclick.toString().includes(system)) {
                            btn.disabled = false;
                            btn.querySelector('.btn-text').textContent = `Buka ${getSystemName(system)}`;
                        }
                    });
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
            document.getElementById('floatingLoadingModal').classList.remove('hidden');

            // Animate progress bar and status
            const progressBar = document.getElementById('loadingProgressBar');
            const statusMessages = document.getElementById('loadingStatus').children;

            setTimeout(() => {
                progressBar.style.width = '30%';
                statusMessages[1].classList.remove('opacity-50');
                statusMessages[1].classList.add('opacity-100');
            }, 500);

            setTimeout(() => {
                progressBar.style.width = '60%';
                statusMessages[2].classList.remove('opacity-50');
                statusMessages[2].classList.add('opacity-100');
            }, 1000);

            setTimeout(() => {
                progressBar.style.width = '100%';
                window.location.href = redirectUrl;
            }, 2000);
        }
    </script>
</x-app-layout>
