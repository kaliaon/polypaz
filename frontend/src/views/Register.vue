<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";

const router = useRouter();
const username = ref("");
const email = ref("");
const firstName = ref("");
const lastName = ref("");
const password = ref("");
const password2 = ref("");
const error = ref("");
const isLoading = ref(false);

const register = async () => {
  if (
    !username.value ||
    !email.value ||
    !password.value ||
    !password2.value ||
    !firstName.value ||
    !lastName.value
  ) {
    error.value = "Please fill in all fields";
    return;
  }

  if (password.value !== password2.value) {
    error.value = "Passwords do not match";
    return;
  }

  error.value = "";
  isLoading.value = true;

  try {
    await api.post("/api/auth/register/", {
      username: username.value,
      email: email.value,
      first_name: firstName.value,
      last_name: lastName.value,
      password: password.value,
      password2: password2.value,
    });

    // Redirect to login page after successful registration
    router.push("/login");
  } catch (err: any) {
    if (err.response?.data) {
      // Format Django validation errors
      const errors = err.response.data;
      const errorMessages = [];

      for (const field in errors) {
        if (Array.isArray(errors[field])) {
          errorMessages.push(`${field}: ${errors[field].join(", ")}`);
        }
      }

      error.value =
        errorMessages.join("\n") || "Registration failed. Please try again.";
    } else {
      error.value = "Registration failed. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-6 text-center">Register</h1>

    <div
      v-if="error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 whitespace-pre-line"
    >
      {{ error }}
    </div>

    <form @submit.prevent="register" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700"
            >First Name</label
          >
          <input
            id="firstName"
            v-model="firstName"
            type="text"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700"
            >Last Name</label
          >
          <input
            id="lastName"
            v-model="lastName"
            type="text"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

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
        <label for="email" class="block text-sm font-medium text-gray-700"
          >Email</label
        >
        <input
          id="email"
          v-model="email"
          type="email"
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
        <label for="password2" class="block text-sm font-medium text-gray-700"
          >Confirm Password</label
        >
        <input
          id="password2"
          v-model="password2"
          type="password"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {{ isLoading ? "Registering..." : "Register" }}
        </button>
      </div>
    </form>

    <div class="mt-4 text-center">
      <p>
        Already have an account?
        <router-link to="/login" class="text-blue-600 hover:text-blue-800"
          >Login</router-link
        >
      </p>
    </div>
  </div>
</template>
