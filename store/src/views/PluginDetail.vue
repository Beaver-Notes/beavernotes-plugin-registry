<script setup>
import {
  RiCloseLine,
  RiPuzzle2Line,
  RiGithubFill,
  RiDownload2Line,
  RiExternalLinkLine,
} from '@remixicon/vue';
import { onMounted, onUnmounted } from 'vue';
import ScreenshotGallery from '../components/ScreenshotGallery.vue';

const props = defineProps({
  plugin: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

function onKeydown(e) {
  if (e.key === 'Escape') emit('close');
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')" />

      <div class="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700">
        <!-- Close button -->
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-10"
        >
          <RiCloseLine class="h-5 w-5" />
        </button>

        <!-- Screenshots -->
        <ScreenshotGallery :screenshots="plugin.screenshots || []" />

        <div class="p-6 space-y-6">
          <!-- Header -->
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-amber-400/10 dark:bg-amber-400/10 flex items-center justify-center">
              <RiPuzzle2Line class="h-7 w-7 text-amber-500 dark:text-amber-400" />
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-xl font-bold text-neutral-900 dark:text-white">
                {{ plugin.name }}
              </h2>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                by {{ plugin.author }}
              </p>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">About</h3>
            <p class="text-neutral-600 dark:text-neutral-200 leading-relaxed">
              {{ plugin.description }}
            </p>
          </div>

          <!-- Tags -->
          <div v-if="plugin.tags && plugin.tags.length > 0">
            <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Tags</h3>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in plugin.tags"
                :key="tag"
                class="px-2.5 py-1 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Info -->
          <div class="grid grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <div>
              <p class="text-xs text-neutral-400 dark:text-neutral-500 mb-0.5">Plugin ID</p>
              <p class="text-sm text-neutral-700 dark:text-neutral-200 font-mono">{{ plugin.id }}</p>
            </div>
            <div>
              <p class="text-xs text-neutral-400 dark:text-neutral-500 mb-0.5">Branch</p>
              <p class="text-sm text-neutral-700 dark:text-neutral-200 font-mono">{{ plugin.branch }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3">
            <a
              :href="`https://github.com/${plugin.repo}/releases`"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-400 text-white text-sm font-medium hover:bg-amber-500 transition-colors shadow-sm"
            >
              <RiDownload2Line class="h-4 w-4" />
              Download .beax
            </a>
            <a
              :href="`https://github.com/${plugin.repo}`"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
            >
              <RiGithubFill class="h-4 w-4" />
              View Source
            </a>
            <a
              v-if="plugin.homepage"
              :href="plugin.homepage"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <RiExternalLinkLine class="h-4 w-4" />
              Homepage
            </a>
          </div>

          <!-- Install instructions -->
          <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <p class="text-sm text-amber-800 dark:text-amber-200">
              <strong>To install:</strong> Download the <code class="px-1 py-0.5 bg-amber-100 dark:bg-amber-800/40 rounded text-xs">.beax</code> file above, then open Beaver Notes and go to <em>Settings &rarr; Plugins &rarr; Install from file</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
