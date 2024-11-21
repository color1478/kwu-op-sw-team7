<template>
  <div>
    <h1>Welcome</h1>
    <div class="button-container">
      <button @click="navigateTo('/html/group-list.html')">Group List</button>
      <button @click="navigateTo('/html/add-data.html')">Add Data</button>
      <button @click="navigateTo('/html/find.html')">Find</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  methods: {
    navigateTo(path) {
      // Vue Router를 사용하는 경우
      this.$router.push(path);
      
      // Vue Router를 사용하지 않는 경우
      // window.location.href = path;
    }
  }
};
</script>

<style scoped>
/* index.css 내용을 여기에 작성하거나 외부 파일을 가져옵니다. */
.button-container {
  display: flex;
  gap: 10px;
}
</style>
