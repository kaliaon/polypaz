<script setup lang="ts">
// Main App component
import LanguageSelector from "./components/LanguageSelector.vue";
import { useI18n } from "vue-i18n";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const isAuthenticated = ref(false);
const user = ref<any>(null);

onMounted(() => {
  checkAuthStatus();
});

const checkAuthStatus = () => {
  // Check if user is logged in by checking localStorage
  const userJson = localStorage.getItem("user");
  const token = localStorage.getItem("access_token");

  if (userJson && token) {
    isAuthenticated.value = true;
    user.value = JSON.parse(userJson);
  } else {
    isAuthenticated.value = false;
    user.value = null;
  }
};

const logout = () => {
  // Clear all auth data
  localStorage.removeItem("user");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  // Update state
  isAuthenticated.value = false;
  user.value = null;

  // Redirect to home page
  router.push("/");
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100"
  >
    <nav class="bg-white shadow-md border-b border-secondary-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <router-link
                to="/"
                class="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent"
              >
                Full-Stack Starter
              </router-link>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/"
                class="border-primary-500 text-secondary-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-primary-500 text-secondary-900"
                inactive-class="border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700"
              >
                {{ t("navigation.home") }}
              </router-link>

              <!-- Show profile link only when authenticated -->
              <router-link
                v-if="isAuthenticated"
                to="/profile"
                class="border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-primary-500 text-secondary-900"
                inactive-class="border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700"
              >
                {{ t("navigation.profile") }}
              </router-link>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <div class="ml-3 relative flex items-center space-x-4">
              <LanguageSelector />

              <!-- Not authenticated: show login and register buttons -->
              <template v-if="!isAuthenticated">
                <router-link
                  to="/login"
                  class="text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {{ t("navigation.login") }}
                </router-link>
                <router-link
                  to="/register"
                  class="bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium shadow-sm hover:shadow transition-all"
                >
                  {{ t("navigation.register") }}
                </router-link>
              </template>

              <!-- Authenticated: show user info and logout button -->
              <template v-else>
                <span class="text-secondary-700 px-3 py-2 text-sm font-medium">
                  {{ user?.username }}
                </span>
                <button
                  @click="logout"
                  class="text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {{ t("navigation.logout") }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="w-full">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer
      class="bg-white shadow-inner border-t border-secondary-200 mt-auto py-6"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-secondary-500 text-sm">
          {{ t("footer.copyright", { year: new Date().getFullYear() }) }}
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
@import "./style.css";

.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
