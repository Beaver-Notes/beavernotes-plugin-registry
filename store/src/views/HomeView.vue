<script setup>
import { ref, computed, onMounted } from "vue";
import { RiStoreLine, RiErrorWarningLine, RiLoaderLine } from "@remixicon/vue";
import SearchBar from "../components/SearchBar.vue";
import PluginCard from "../components/PluginCard.vue";
import PluginDetail from "./PluginDetail.vue";

const REGISTRY_URL = import.meta.env.DEV
    ? "/plugins.json"
    : "https://raw.githubusercontent.com/Beaver-Notes/beaver-notes-plugin-registry/main/plugins.json";

const plugins = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref("");
const selectedPlugin = ref(null);

const filteredPlugins = computed(() => {
    if (!searchQuery.value.trim()) return plugins.value;

    const q = searchQuery.value.toLowerCase();
    return plugins.value.filter(
        (p) =>
            p.name.toLowerCase().includes(q) ||
            p.author.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (p.tags || []).some((t) => t.toLowerCase().includes(q)),
    );
});

async function fetchPlugins() {
    loading.value = true;
    error.value = null;
    try {
        const res = await fetch(REGISTRY_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        plugins.value = Array.isArray(data) ? data : [];
    } catch (e) {
        error.value = e.message || "Failed to load plugins";
    } finally {
        loading.value = false;
    }
}

onMounted(fetchPlugins);
</script>

<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <!-- Hero -->
        <div class="text-center py-12 sm:py-16">
            <div
                class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400/10 mb-6"
            >
                <RiStoreLine
                    class="h-8 w-8 text-amber-500 dark:text-amber-400"
                />
            </div>
            <h1
                class="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white"
            >
                Beaver Notes Plugin Store
            </h1>
            <p
                class="mt-4 text-lg leading-8 text-neutral-600 dark:text-neutral-200 max-w-2xl mx-auto"
            >
                Discover community plugins to extend Beaver Notes. Install them
                directly from the in-app store or download from GitHub.
            </p>

            <div class="mt-8 max-w-md mx-auto">
                <SearchBar
                    v-model="searchQuery"
                    placeholder="Search by name, author, or tag..."
                />
            </div>
        </div>

        <!-- Loading -->
        <div
            v-if="loading"
            class="flex flex-col items-center justify-center py-20"
        >
            <RiLoaderLine class="h-8 w-8 text-amber-400 animate-spin mb-4" />
            <p class="text-neutral-500 dark:text-neutral-400 text-sm">
                Loading plugins...
            </p>
        </div>

        <!-- Error -->
        <div
            v-else-if="error"
            class="max-w-lg mx-auto p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-center"
        >
            <RiErrorWarningLine class="h-8 w-8 text-red-500 mx-auto mb-3" />
            <p class="text-red-600 dark:text-red-400 text-sm">{{ error }}</p>
        </div>

        <!-- Empty search -->
        <div
            v-else-if="filteredPlugins.length === 0 && searchQuery"
            class="text-center py-20"
        >
            <p class="text-neutral-500 dark:text-neutral-400">
                No plugins match "{{ searchQuery }}"
            </p>
        </div>

        <!-- Plugin grid -->
        <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            <PluginCard
                v-for="plugin in filteredPlugins"
                :key="plugin.id"
                :plugin="plugin"
                @click="selectedPlugin = $event"
            />
        </div>

        <!-- Plugin count -->
        <p
            class="mt-10 text-center text-sm text-neutral-400 dark:text-neutral-500"
        >
            {{ filteredPlugins.length }} plugin{{
                filteredPlugins.length !== 1 ? "s" : ""
            }}
        </p>
    </div>

    <!-- Detail modal -->
    <Teleport to="body">
        <PluginDetail
            v-if="selectedPlugin"
            :plugin="selectedPlugin"
            @close="selectedPlugin = null"
        />
    </Teleport>
</template>
