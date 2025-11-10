<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";

const router = useRouter();
const user = ref<any>(null);
const isLoading = ref(true);
const error = ref("");

onMounted(async () => {
  const userJson = localStorage.getItem("user");
  const token = localStorage.getItem("access_token");

  if (!userJson || !token) {
    router.push("/login");
    return;
  }

  user.value = JSON.parse(userJson);

  try {
    // Get the latest user profile data
    const response = await api.get("/api/auth/profile/");

    user.value = response.data;
    localStorage.setItem("user", JSON.stringify(response.data));
  } catch (err) {
    console.error("Failed to fetch profile data", err);
    error.value = "Failed to load profile data";
  } finally {
    isLoading.value = false;
  }
});

const logout = () => {
  // Clear all auth data
  localStorage.removeItem("user");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  // Redirect to login page
  router.push("/login");
};
</script>

<template>
  <div class="max-w-3xl mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
    <div v-if="isLoading" class="flex justify-center">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
    >
      {{ error }}
    </div>

    <div v-else>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Your Profile</h1>
        <button
          @click="logout"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Username</p>
            <p class="font-medium">{{ user.username }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Email</p>
            <p class="font-medium">{{ user.email }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-500">First Name</p>
            <p class="font-medium">{{ user.first_name }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-500">Last Name</p>
            <p class="font-medium">{{ user.last_name }}</p>
          </div>
        </div>
      </div>

      <div class="border-t pt-4">
        <p class="text-gray-700">
          This is a protected route that requires authentication. You can only
          see this page if you are logged in.
        </p>
      </div>
    </div>
  </div>
</template>
