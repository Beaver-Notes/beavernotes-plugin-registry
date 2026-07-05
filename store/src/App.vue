<script setup>
import { ref, onMounted, provide } from "vue";
import {
    RiMoonLine,
    RiSunLine,
    RiMenuLine,
    RiCloseLine,
    RiGithubFill,
    RiExternalLinkLine,
} from "@remixicon/vue";
import StoreFooter from "./components/StoreFooter.vue";
import HomeView from "./views/HomeView.vue";
import PluginDetail from "./views/PluginDetail.vue";

const isDarkMode = ref(false);
const mobileMenuOpen = ref(false);
const selectedPlugin = ref(null);

function toggleDarkMode() {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
        html.classList.remove("dark");
        isDarkMode.value = false;
        localStorage.setItem("theme", "light");
    } else {
        html.classList.add("dark");
        isDarkMode.value = true;
        localStorage.setItem("theme", "dark");
    }
}

function showPlugin(plugin) {
    selectedPlugin.value = plugin;
}

function closeDetail() {
    selectedPlugin.value = null;
}

onMounted(() => {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme) {
        if (savedTheme === "dark") {
            html.classList.add("dark");
            isDarkMode.value = true;
        } else {
            html.classList.remove("dark");
            isDarkMode.value = false;
        }
    } else if (systemPrefersDark) {
        html.classList.add("dark");
        isDarkMode.value = true;
    }

    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
            if (!localStorage.getItem("theme")) {
                if (e.matches) {
                    html.classList.add("dark");
                    isDarkMode.value = true;
                } else {
                    html.classList.remove("dark");
                    isDarkMode.value = false;
                }
            }
        });
});

provide("showPlugin", showPlugin);
</script>

<template>
    <div class="min-h-screen flex flex-col">
        <!-- Navbar -->
        <div class="sticky top-3 z-10 px-3 sm:px-6">
            <div class="relative max-w-7xl mx-auto">
                <nav
                    class="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-200/70 dark:border-neutral-700/60 shadow-md shadow-neutral-900/5 dark:shadow-neutral-900/30 rounded-2xl"
                >
                    <div class="px-2">
                        <div
                            class="relative flex h-14 items-center justify-between"
                        >
                            <div class="flex items-center">
                                <a
                                    href="/beaver-notes-plugin-registry/"
                                    class="flex shrink-0 items-center"
                                >
                                    <img
                                        class="h-8 w-auto"
                                        src="/src/assets/logo.png"
                                        alt="Beaver Notes"
                                    />
                                    <p
                                        class="ml-3 text-base font-bold text-neutral-900 dark:text-neutral-100"
                                    >
                                        Plugin Store
                                    </p>
                                </a>
                            </div>

                            <div class="flex items-center space-x-1">
                                <button
                                    @click="toggleDarkMode"
                                    class="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                                >
                                    <RiSunLine
                                        v-if="isDarkMode"
                                        class="h-5 w-5"
                                    />
                                    <RiMoonLine v-else class="h-5 w-5" />
                                </button>

                                <button
                                    type="button"
                                    class="sm:hidden p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                                    @click="mobileMenuOpen = !mobileMenuOpen"
                                >
                                    <RiCloseLine
                                        v-if="mobileMenuOpen"
                                        class="h-6 w-6"
                                    />
                                    <RiMenuLine v-else class="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <!-- Mobile dropdown -->
                <div
                    v-if="mobileMenuOpen"
                    class="sm:hidden absolute left-0 right-0 top-full mt-2 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-200/70 dark:border-neutral-700/60 shadow-md shadow-neutral-900/5 dark:shadow-neutral-900/30 rounded-2xl overflow-hidden"
                >
                    <div class="px-4 py-3 space-y-1">
                        <a
                            href="https://beavernotes.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            @click="mobileMenuOpen = false"
                            class="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                        >
                            beavernotes.com
                        </a>
                        <a
                            href="https://github.com/Beaver-Notes/beaver-notes-plugin-registry"
                            target="_blank"
                            rel="noopener noreferrer"
                            @click="mobileMenuOpen = false"
                            class="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                        >
                            Submit a plugin
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main content -->
        <main class="flex-1 pt-6 pb-16">
            <HomeView v-if="!selectedPlugin" @show-plugin="showPlugin" />
            <PluginDetail
                v-else
                :plugin="selectedPlugin"
                @close="closeDetail"
            />
        </main>

        <StoreFooter />
    </div>
</template>
