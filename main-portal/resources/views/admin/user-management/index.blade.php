<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>User Management - {{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])

        <!-- Tailwind CSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        <!-- Alpine.js -->
        <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    </head>
    <body class="font-sans antialiased" x-data="userManagement()">
        <div class="min-h-screen bg-gray-100">
            @include('layouts.navigation')

            <!-- Page Heading -->
            <header class="bg-white shadow">
                <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 class="text-2xl font-bold text-gray-900">👥 User Management</h1>
                    <p class="mt-1 text-sm text-gray-600">Manage users across all LSP Gatensi systems</p>
                </div>
            </header>

            <!-- Page Content -->
            <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <!-- Check User Section -->
                <div class="bg-white rounded-lg shadow mb-6 p-6">
                    <h2 class="text-lg font-semibold mb-4">🔍 Check User Email</h2>
                    <div class="flex gap-4">
                        <input
                            type="email"
                            x-model="checkEmail"
                            @keyup.enter="checkUser()"
                            placeholder="Enter email to check..."
                            class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                        <button
                            @click="checkUser()"
                            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                            Check
                        </button>
                    </div>

                    <!-- Results -->
                    <div x-show="checkResults" class="mt-4" x-transition>
                        <template x-for="(result, system) in checkResults" :key="system">
                            <div class="flex items-center justify-between p-3 mb-2 rounded-lg"
                                 :class="result.found ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
                                <div class="flex items-center">
                                    <span class="font-semibold capitalize" x-text="system + ':'"></span>
                                    <span class="ml-2" x-text="result.found ? '✅ Found' : '❌ Not Found'"></span>
                                    <template x-if="result.found">
                                        <span class="ml-2 text-sm text-gray-600" x-text="'(ID: ' + result.user.id + ', Role: ' + result.user.role + ')'"></span>
                                    </template>
                                </div>
                                <template x-if="!result.found && result.user">
                                    <button
                                        @click="openCreateModal(system)"
                                        class="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                        Create User
                                    </button>
                                </template>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Systems Tabs -->
                <div class="bg-white rounded-lg shadow">
                    <div class="border-b border-gray-200">
                        <nav class="flex -mb-px">
                            <template x-for="system in systems" :key="system">
                                <button
                                    @click="activeSystem = system"
                                    :disabled="loading"
                                    :class="activeSystem === system ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                    class="py-2 px-6 border-b-2 font-medium text-sm capitalize relative">
                                    <div class="flex items-center">
                                        <span x-text="system === 'all' ? '🌐' : system === 'balai' ? '🏢' : system === 'reguler' ? '👤' : system === 'fg' ? '⚡' : '🔧'"></span>
                                        <span class="ml-2" x-text="system === 'all' ? 'All Systems' : system"></span>
                                        <span class="ml-2 px-2 py-1 text-xs rounded-full"
                                              :class="activeSystem === system ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
                                              x-text="systemStats[system] || '...'"></span>
                                        <div x-show="loading && activeSystem === system" class="ml-2">
                                            <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </div>
                                </button>
                            </template>
                        </nav>
                    </div>

                    <!-- System Content -->
                    <div class="p-6 relative">
                        <!-- Search Bar -->
                        <div class="mb-4 flex justify-between">
                            <div class="flex-1 max-w-md">
                                <input
                                    type="text"
                                    x-model="search"
                                    @keyup.debounce="loadUsers()"
                                    placeholder="Search users..."
                                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                            </div>
                            <button
                                @click="activeSystem !== 'all' && openCreateModal(activeSystem)"
                                :disabled="activeSystem === 'all'"
                                :class="activeSystem === 'all' ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'hover:bg-green-700 bg-green-600'"
                                class="ml-4 px-4 py-2 text-white rounded-md">
                                + Create New User
                            </button>
                        </div>

                        <!-- Users Table Container -->
                        <div class="relative">
                            <!-- Loading Overlay -->
                            <div x-show="loading" class="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 min-h-[200px]">
                                <div class="flex items-center space-x-2">
                                    <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span class="text-gray-600">Loading users...</span>
                                </div>
                            </div>

                            <!-- Users Table -->
                            <div class="overflow-x-auto" :class="{ 'opacity-50': loading }">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" x-show="activeSystem === 'all'">System</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <template x-for="user in users.data" :key="user.id + '_' + (user.system || activeSystem)">
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="user.id"></td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="user.name"></td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="user.email"></td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800" x-text="user.role"></span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-show="activeSystem === 'all'">
                                                <span class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800" x-text="user.system_display || user.system || activeSystem"></span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" x-text="user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'"></td>
                                        </tr>
                                    </template>
                                    <tr x-show="users.data === undefined || users.data.length === 0">
                                        <td :colspan="activeSystem === 'all' ? '6' : '5'" class="px-6 py-8 text-center text-sm text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <div class="mt-4 flex items-center justify-between" x-show="users.last_page > 1">
                            <div class="text-sm text-gray-700">
                                Showing <span x-text="users.from"></span> to <span x-text="users.to"></span> of <span x-text="users.total"></span> results
                            </div>
                            <div class="flex gap-2">
                                <button
                                    @click="changePage(users.current_page - 1)"
                                    :disabled="users.current_page === 1"
                                    class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                                    Previous
                                </button>
                                <button
                                    @click="changePage(users.current_page + 1)"
                                    :disabled="users.current_page === users.last_page"
                                    class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Create User Modal -->
        <div x-show="showCreateModal"
             x-transition:enter="transition ease-out duration-300"
             x-transition:enter-start="opacity-0"
             x-transition:enter-end="opacity-100"
             x-transition:leave="transition ease-in duration-200"
             x-transition:leave-start="opacity-100"
             x-transition:leave-end="opacity-0"
             class="fixed inset-0 overflow-y-auto z-50"
             style="display: none;">
            <div class="flex items-center justify-center min-h-screen px-4">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75" @click="showCreateModal = false"></div>

                <div class="relative bg-white rounded-lg max-w-md w-full p-6">
                    <h3 class="text-lg font-semibold mb-4">Create User in <span x-text="createSystem.toUpperCase()"></span></h3>

                    <form @submit.prevent="createUser()">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                x-model="createUserForm.email"
                                required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                x-model="createUserForm.name"
                                required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                x-model="createUserForm.role"
                                required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select Role</option>
                                <template x-for="role in systemRoles" :key="role">
                                    <option :value="role" x-text="role"></option>
                                </template>
                            </select>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                x-model="createUserForm.password"
                                required
                                minlength="6"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <template x-if="createSystem === 'tuk'">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    x-model="createUserForm.username"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </template>

                        <div class="flex justify-end gap-3">
                            <button
                                type="button"
                                @click="showCreateModal = false"
                                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                :disabled="createLoading"
                                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                                <span x-show="!createLoading">Create User</span>
                                <span x-show="createLoading">Creating...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </body>

    <script>
        function userManagement() {
            return {
                systems: ['all', 'balai', 'reguler', 'fg', 'tuk'],
                activeSystem: 'all',
                checkEmail: '',
                checkResults: null,
                users: { data: [] },
                search: '',
                systemStats: {},
                loading: false,
                showCreateModal: false,
                createSystem: '',
                systemRoles: [],
                createLoading: false,
                createUserForm: {
                    email: '',
                    name: '',
                    role: '',
                    password: '',
                    username: ''
                },

                init() {
                    this.loadUsers();
                    this.loadSystemStats();
                },

                watch: {
                    activeSystem(newSystem, oldSystem) {
                        if (newSystem !== oldSystem) {
                            this.search = ''; // Clear search when switching tabs
                            this.loadUsers();
                        }
                    }
                },

                async checkUser() {
                    if (!this.checkEmail) return;

                    try {
                        const response = await fetch('/admin/users/check', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                            },
                            body: JSON.stringify({ email: this.checkEmail })
                        });

                        this.checkResults = await response.json();
                    } catch (error) {
                        alert('Error checking user');
                    }
                },

                async loadUsers() {
                    this.loading = true;
                    try {
                        const response = await fetch(`/admin/users/${this.activeSystem}?search=${this.search}`);
                        this.users = await response.json();
                    } catch (error) {
                        console.error('Error loading users');
                        this.users = { data: [] };
                    } finally {
                        this.loading = false;
                    }
                },

                async loadSystemStats() {
                    // Calculate total for "All" tab
                    let totalUsers = 0;

                    for (const system of this.systems) {
                        if (system === 'all') {
                            this.systemStats[system] = '∑'; // Show sigma symbol for all
                            continue;
                        }

                        try {
                            const response = await fetch(`/admin/users/${system}?per_page=1`);
                            const data = await response.json();
                            this.systemStats[system] = data.total || 0;
                            totalUsers += data.total || 0;
                        } catch (error) {
                            this.systemStats[system] = '?';
                        }
                    }

                    // Update total count for All tab
                    this.systemStats['all'] = totalUsers;
                },

                async openCreateModal(system) {
                    this.createSystem = system;
                    this.showCreateModal = true;
                    this.createUserForm = {
                        email: this.checkEmail || '',
                        name: '',
                        role: '',
                        password: '',
                        username: ''
                    };

                    // Load roles for this system
                    try {
                        const response = await fetch(`/admin/system-info/${system}`);
                        const data = await response.json();
                        this.systemRoles = data.roles || [];
                    } catch (error) {
                        this.systemRoles = [];
                    }
                },

                async createUser() {
                    this.createLoading = true;

                    try {
                        const response = await fetch('/admin/users/create', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                            },
                            body: JSON.stringify({
                                system: this.createSystem,
                                ...this.createUserForm
                            })
                        });

                        const result = await response.json();

                        if (result.success) {
                            alert('User created successfully!');
                            this.showCreateModal = false;
                            this.loadUsers();
                            this.loadSystemStats();
                            if (this.checkEmail) {
                                this.checkUser();
                            }
                        } else {
                            alert('Error: ' + result.message);
                        }
                    } catch (error) {
                        alert('Error creating user');
                    } finally {
                        this.createLoading = false;
                    }
                },

                changePage(page) {
                    // TODO: Implement pagination
                    console.log('Change to page:', page);
                }
            }
        }
    </script>
</html>