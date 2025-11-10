<script setup lang="ts">
import { ref, onMounted } from "vue";
import { availableLocales, setLocale } from "@/i18n";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();
const isOpen = ref(false);
const dropdownRef = ref<HTMLDivElement | null>(null);

// Get current selected language display name
const currentLanguage = ref(
  availableLocales.find((lang) => lang.code === locale.value)?.name || "English"
);

// Handle language change
const changeLanguage = async (langCode: string) => {
  const success = await setLocale(langCode);
  if (success) {
    const langName = availableLocales.find(
      (lang) => lang.code === langCode
    )?.name;
    if (langName) {
      currentLanguage.value = langName;
    }
    isOpen.value = false;
  }
};

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.value &&
      !dropdownRef.value.contains(event.target as Node) &&
      isOpen.value
    ) {
      isOpen.value = false;
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
});
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-1 text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium"
      type="button"
      aria-haspopup="true"
      :aria-expanded="isOpen"
    >
      <span>{{ currentLanguage }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-show="isOpen"
      class="absolute right-0 mt-1 bg-white rounded-md shadow-lg py-1 z-10 min-w-[120px]"
    >
      <button
        v-for="lang in availableLocales"
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        class="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
        :class="{ 'bg-secondary-50': lang.code === locale }"
      >
        {{ lang.name }}
      </button>
    </div>
  </div>
</template>
