<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";

const router = useRouter();
const username = ref("");
const password = ref("");
const error = ref("");
const isLoading = ref(false);

const login = async () => {
  if (!username.value || !password.value) {
    error.value = "Please enter both username and password";
    return;
  }

  error.value = "";
  isLoading.value = true;

  try {
    const response = await api.post("/api/auth/login/", {
      username: username.value,
      password: password.value,
    });

    // Store user data and tokens in localStorage
    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("access_token", response.data.tokens.access);
    localStorage.setItem("refresh_token", response.data.tokens.refresh);

    // Redirect to profile page
    router.push("/profile");
  } catch (err: any) {
    error.value =
      err.response?.data?.message || "Login failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-6 text-center">Login</h1>

    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
    >
      {{ error }}
    </div>

    <form @submit.prevent="login" class="space-y-4">
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700"
          >Username</label
        >
        <input
          id="username"
          v-model="username"
          type="text"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700"
          >Password</label
        >
        <input
          id="password"
          v-model="password"
          type="password"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {{ isLoading ? "Logging in..." : "Login" }}
        </button>
      </div>
    </form>

    <div class="mt-4 text-center">
      <p>
        Don't have an account?
        <router-link to="/register" class="text-blue-600 hover:text-blue-800"
          >Register</router-link
        >
      </p>
    </div>
  </div>
</template>
