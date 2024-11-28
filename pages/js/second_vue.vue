<template>
  <div class="container">
    <button class="back-button" @click="goBack">뒤로가기</button>
    <h1>Find Group</h1>
    <label for="search-name">Name:</label>
    <input
      type="text"
      id="search-name"
      v-model="name"
      placeholder="Enter person's name"
      required
    />

    <label for="search-phone">Phone Number:</label>
    <input
      type="text"
      id="search-phone"
      v-model="phoneNumber"
      placeholder="Enter phone number"
      required
    />

    <button @click="search">Search</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      phoneNumber: "",
    };
  },
  methods: {
    goBack() {
      this.$router.push("/");
    },
    search() {
      console.log("Searching for:", this.name, this.phoneNumber);
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
