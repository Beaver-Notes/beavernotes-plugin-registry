<script setup>
import { RiPuzzle2Line, RiGithubFill, RiImageLine } from "@remixicon/vue";

defineProps({
    plugin: {
        type: Object,
        required: true,
    },
});

defineEmits(["click"]);
</script>

<template>
    <div
        class="bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
        @click="$emit('click', plugin)"
    >
        <!-- Screenshot preview -->
        <div
            class="aspect-video bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center overflow-hidden"
        >
            <img
                v-if="plugin.screenshots && plugin.screenshots.length > 0"
                :src="plugin.screenshots[0]"
                :alt="plugin.name + ' screenshot'"
                class="w-full h-full object-cover"
                loading="lazy"
            />
            <div
                v-else
                class="flex flex-col items-center gap-2 text-neutral-400 dark:text-neutral-500"
            >
                <RiImageLine class="h-10 w-10" />
                <span class="text-xs">No preview</span>
            </div>
        </div>

        <div class="p-4 space-y-3">
            <div class="flex items-start gap-3">
                <div
                    class="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-400/10 dark:bg-amber-400/10 flex items-center justify-center"
                >
                    <RiPuzzle2Line
                        class="h-5 w-5 text-amber-500 dark:text-amber-400"
                    />
                </div>
                <div class="min-w-0 flex-1">
                    <h3
                        class="font-semibold text-neutral-900 dark:text-white truncate group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors"
                    >
                        {{ plugin.name }}
                    </h3>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">
                        {{ plugin.author }}
                    </p>
                </div>
            </div>

            <p
                class="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed"
            >
                {{ plugin.description }}
            </p>

            <div class="flex flex-wrap gap-1.5">
                <span
                    v-for="tag in plugin.tags || []"
                    :key="tag"
                    class="px-2 py-0.5 text-[11px] font-medium rounded-full bg-neutral-200/70 dark:bg-neutral-700/70 text-neutral-600 dark:text-neutral-300"
                >
                    {{ tag }}
                </span>
            </div>
        </div>

        <div
            class="bg-neutral-500/5 dark:bg-white/5 flex z-10 items-center text-neutral-600 dark:text-neutral-200 gap-1 p-2 px-4 bottom-0"
        >
            <a
                :href="`https://github.com/${plugin.repo}`"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop
                class="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            >
                <RiGithubFill class="h-3.5 w-3.5" />
                {{ plugin.repo }}
            </a>
            <span
                v-if="plugin.screenshots && plugin.screenshots.length > 0"
                class="text-xs text-neutral-400 dark:text-neutral-500"
            >
                {{ plugin.screenshots.length }} screenshot{{
                    plugin.screenshots.length > 1 ? "s" : ""
                }}
            </span>
        </div>
    </div>
</template>
