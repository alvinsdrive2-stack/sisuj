<nav x-data="{ open: false, sidebarOpen: false }" class="bg-white border-b border-gray-100 navbar-stable navbar-preserve relative">
    <!-- Sidebar Toggle Button -->
    <button @click="sidebarOpen = !sidebarOpen" class="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700 transition-all duration-200 shadow-lg">
        <i :class="sidebarOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right'" class="text-sm"></i>
    </button>

    <!-- Collapsed Sidebar -->
    <div x-show="sidebarOpen"
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0 -translate-x-full"
         x-transition:enter-end="opacity-100 translate-x-0"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100 translate-x-0"
         x-transition:leave-end="opacity-0 -translate-x-full"
         class="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-40 border-r border-gray-200">
        <!-- Sidebar Content -->
        <div class="p-6">
            <div class="flex items-center mb-6">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                    <i class="fas fa-globe"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-800">Portal Sistem</h3>
            </div>
            <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Terintegrasi</h4>

            <!-- Menu Items -->
            <div class="space-y-2">
                <div class="group">
                    <div class="px-4 py-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-database text-blue-600 mr-3"></i>
                            <div>
                                <p class="text-sm font-medium text-gray-900">Database Balai</p>
                                <p class="text-xs text-gray-500">98 users</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="group">
                    <div class="px-4 py-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-users text-green-600 mr-3"></i>
                            <div>
                                <p class="text-sm font-medium text-gray-900">Database Reguler</p>
                                <p class="text-xs text-gray-500">380 users</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="group">
                    <div class="px-4 py-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-bolt text-amber-600 mr-3"></i>
                            <div>
                                <p class="text-sm font-medium text-gray-900">Database FG/Suisei</p>
                                <p class="text-xs text-gray-500">64 users</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="group">
                    <div class="px-4 py-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-wrench text-red-600 mr-3"></i>
                            <div>
                                <p class="text-sm font-medium text-gray-900">Database TUK</p>
                                <p class="text-xs text-gray-500">92 users</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Statistics -->
            <div class="mt-8 pt-6 border-t border-gray-200">
                <div class="text-xs text-gray-500 mb-2">Total Users</div>
                <div class="text-2xl font-bold text-gray-800">545</div>
                <div class="text-xs text-gray-500 mt-1">Across all systems</div>
            </div>
        </div>
    </div>

    <!-- Overlay to close sidebar -->
    <div x-show="sidebarOpen"
         @click="sidebarOpen = false"
         x-transition:enter="transition-opacity ease-linear duration-300"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="transition-opacity ease-linear duration-300"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         class="fixed inset-0 bg-black bg-opacity-50 z-30"></div>

    <!-- Primary Navigation Menu -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex">
                <!-- Logo -->
                <div class="shrink-0 flex items-center">
                    <a href="{{ route('dashboard') }}" class="logo-fixed logo-container">
                        <x-application-logo class="block" />
                    </a>
                </div>

                <!-- Navigation Links -->
                <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    <x-nav-link :href="route('dashboard')" :active="request()->routeIs('dashboard')">
                        {{ __('Dashboard') }}
                    </x-nav-link>
                    @if(Auth::check() && in_array(Auth::user()->role, ['admin', 'super_admin']))
                        <x-nav-link :href="route('admin.users.index')" :active="request()->routeIs('admin.users.*')">
                            {{ __('User Management') }}
                        </x-nav-link>
                    @endif
                </div>
            </div>

            <!-- Settings Dropdown -->
            <div class="hidden sm:flex sm:items-center sm:ms-6">
                <x-dropdown align="right" width="48">
                    <x-slot name="trigger">
                        <button class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150">
                            <div>{{ Auth::user()->name }}</div>

                            <div class="ms-1">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </x-slot>

                    <x-slot name="content">
                        <x-dropdown-link :href="route('profile.edit')">
                            {{ __('Profile') }}
                        </x-dropdown-link>

                        <!-- Authentication -->
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf

                            <x-dropdown-link :href="route('logout')"
                                    onclick="event.preventDefault();
                                                this.closest('form').submit();">
                                {{ __('Log Out') }}
                            </x-dropdown-link>
                        </form>
                    </x-slot>
                </x-dropdown>
            </div>

            <!-- Hamburger -->
            <div class="-me-2 flex items-center sm:hidden">
                <button @click="open = ! open" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out">
                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path :class="{'hidden': open, 'inline-flex': ! open }" class="inline-flex" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        <path :class="{'hidden': ! open, 'inline-flex': open }" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Responsive Navigation Menu -->
    <div :class="{'block': open, 'hidden': ! open}" class="hidden sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
            <x-responsive-nav-link :href="route('dashboard')" :active="request()->routeIs('dashboard')">
                {{ __('Dashboard') }}
            </x-responsive-nav-link>
            @if(Auth::check() && in_array(Auth::user()->role, ['admin', 'super_admin']))
                <x-responsive-nav-link :href="route('admin.users.index')" :active="request()->routeIs('admin.users.*')">
                    {{ __('User Management') }}
                </x-responsive-nav-link>
            @endif
        </div>

        <!-- Responsive Settings Options -->
        <div class="pt-4 pb-1 border-t border-gray-200">
            <div class="px-4">
                <div class="font-medium text-base text-gray-800">{{ Auth::user()->name }}</div>
                <div class="font-medium text-sm text-gray-500">{{ Auth::user()->email }}</div>
            </div>

            <div class="mt-3 space-y-1">
                <x-responsive-nav-link :href="route('profile.edit')">
                    {{ __('Profile') }}
                </x-responsive-nav-link>

                <!-- Authentication -->
                <form method="POST" action="{{ route('logout') }}">
                    @csrf

                    <x-responsive-nav-link :href="route('logout')"
                            onclick="event.preventDefault();
                                        this.closest('form').submit();">
                        {{ __('Log Out') }}
                    </x-responsive-nav-link>
                </form>
            </div>
        </div>
    </div>
</nav>
