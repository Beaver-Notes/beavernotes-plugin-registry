<script setup>
import {
  RiTwitterFill,
  RiBlueskyFill,
  RiMastodonFill,
  RiRedditFill,
  RiGithubFill,
  RiCupFill,
} from '@remixicon/vue';

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/Beaver-Notes/Beaver-Notes',
    icon: RiGithubFill,
    color: 'hover:text-neutral-800 dark:hover:text-neutral-100',
  },
  {
    name: 'Reddit',
    href: 'https://www.reddit.com/r/BeaverNotes/',
    icon: RiRedditFill,
    color: 'hover:text-orange-500',
  },
  {
    name: 'Mastodon',
    href: 'https://mastodon.social/@Beavernotes',
    icon: RiMastodonFill,
    color: 'hover:text-[#6364FF]',
  },
  {
    name: 'BlueSky',
    href: 'https://bsky.app/profile/beavernotes.com',
    icon: RiBlueskyFill,
    color: 'hover:text-blue-500',
  },
  {
    name: 'X/Twitter',
    href: 'https://x.com/BeaverNotes',
    icon: RiTwitterFill,
    color: 'hover:text-blue-400',
  },
  {
    name: 'Donate',
    href: 'https://github.com/sponsors/Beaver-Notes',
    icon: RiCupFill,
    color: 'hover:text-blue-400',
  },
];
</script>

<template>
  <section class="bg-white dark:bg-neutral-900 mt-8">
    <div class="max-w-screen-xl px-4 py-12 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">
      <nav class="flex flex-wrap justify-center -mx-5 -my-2">
        <div class="px-5 py-2">
          <a
            href="https://beavernotes.com"
            class="text-base leading-6 text-neutral-500 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            Beaver Notes
          </a>
        </div>
        <div class="px-5 py-2">
          <a
            href="https://docs.beavernotes.com"
            target="_blank"
            rel="noopener"
            class="text-base leading-6 text-neutral-500 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            Docs
          </a>
        </div>
        <div class="px-5 py-2">
          <a
            href="https://github.com/Beaver-Notes/beaver-notes-plugin-registry"
            target="_blank"
            rel="noopener"
            class="text-base leading-6 text-neutral-500 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            Submit a Plugin
          </a>
        </div>
      </nav>
      <div class="flex justify-center mt-8 space-x-6">
        <a
          v-for="link in socialLinks"
          :key="link.name"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          :class="`text-neutral-400 ${link.color}`"
          class="transition-colors duration-200"
        >
          <span class="sr-only">{{ link.name }}</span>
          <component :is="link.icon" class="w-6 h-6" aria-hidden="true" />
        </a>
      </div>
      <p class="mt-8 text-base leading-6 text-center text-neutral-400">
        &copy; {{ new Date().getFullYear() }} Beaver Notes. Open-source, local-first, and user-owned.
      </p>
    </div>
  </section>
</template>
