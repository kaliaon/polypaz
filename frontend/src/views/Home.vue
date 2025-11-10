<script setup lang="ts">
// Home view component
import { useI18n } from "vue-i18n";
import { ref, onMounted } from "vue";

const { t } = useI18n();
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
</script>

<template>
  <div>
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div class="container mx-auto px-4 py-16 md:py-24">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-6">
            {{ t("home.title") }}
          </h1>

          <!-- Different subtitles based on authentication status -->
          <p
            v-if="!isAuthenticated"
            class="text-xl md:text-2xl text-primary-100 mb-8"
          >
            {{ t("home.subtitle") }}
          </p>
          <p v-else class="text-xl md:text-2xl text-primary-100 mb-8">
            {{ t("home.welcomeBack", { username: user?.username || "" }) }}
          </p>

          <!-- Different CTA buttons based on authentication status -->
          <div
            v-if="!isAuthenticated"
            class="flex flex-wrap justify-center gap-4"
          >
            <router-link
              to="/login"
              class="px-6 py-3 bg-white text-primary-700 font-medium rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-primary-50 transform hover:-translate-y-0.5"
            >
              {{ t("navigation.login") }}
            </router-link>
            <router-link
              to="/register"
              class="px-6 py-3 bg-accent-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-accent-600 transform hover:-translate-y-0.5"
            >
              {{ t("navigation.register") }}
            </router-link>
          </div>
          <div v-else class="flex flex-wrap justify-center gap-4">
            <router-link
              to="/profile"
              class="px-6 py-3 bg-white text-primary-700 font-medium rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-primary-50 transform hover:-translate-y-0.5"
            >
              {{ t("navigation.profile") }}
            </router-link>
            <a
              href="#features"
              class="px-6 py-3 bg-accent-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-accent-600 transform hover:-translate-y-0.5"
            >
              {{ t("home.exploreFeatures") }}
            </a>
          </div>
        </div>
      </div>

      <!-- Wave Divider -->
      <div class="w-full h-24 relative overflow-hidden">
        <svg
          class="absolute bottom-0 w-full h-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#f8fafc"
            fill-opacity="1"
            d="M0,224L80,208C160,192,320,160,480,165.3C640,171,800,213,960,213.3C1120,213,1280,171,1360,149.3L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Features Section -->
    <div id="features" class="container mx-auto px-4 py-12">
      <h2 class="text-3xl font-bold text-center mb-12 text-secondary-800">
        {{ t("features.title") }}
      </h2>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Backend Feature -->
        <div class="card p-6 flex flex-col items-center text-center">
          <div class="bg-primary-100 p-4 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-secondary-800">
            {{ t("features.backend.title") }}
          </h3>
          <p class="text-secondary-600">
            {{ t("features.backend.description") }}
          </p>
        </div>

        <!-- Frontend Feature -->
        <div class="card p-6 flex flex-col items-center text-center">
          <div class="bg-primary-100 p-4 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-secondary-800">
            {{ t("features.frontend.title") }}
          </h3>
          <p class="text-secondary-600">
            {{ t("features.frontend.description") }}
          </p>
        </div>

        <!-- Styling Feature -->
        <div class="card p-6 flex flex-col items-center text-center">
          <div class="bg-primary-100 p-4 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-secondary-800">
            {{ t("features.styling.title") }}
          </h3>
          <p class="text-secondary-600">
            {{ t("features.styling.description") }}
          </p>
        </div>
      </div>

      <div class="text-center mt-12">
        <!-- Different CTA based on authentication status -->
        <router-link
          v-if="!isAuthenticated"
          to="/register"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          {{ t("home.getStarted") }}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </router-link>
        <router-link
          v-else
          to="/profile"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          {{ t("navigation.profile") }}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </router-link>
      </div>
    </div>
  </div>
</template>
