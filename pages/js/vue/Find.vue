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
  
      <div 
        id="result" 
        class="result" 
        :class="{ 'no-result': !searchResult }">
        {{ searchResult || "No results found." }}
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        name: "",
        phoneNumber: "",
        searchResult: null,
      };
    },
    methods: {
      goBack() {
        this.$router.push("/"); // 라우터를 사용하여 메인 페이지로 이동
      },
      search() {
        // 예제 검색 로직
        if (this.name && this.phoneNumber) {
          this.searchResult = `Searching for ${this.name} with phone number ${this.phoneNumber}`;
        } else {
          this.searchResult = null;
        }
      },
    },
  };
  </script>
  
  <style>
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
  
  .container {
    max-width: 600px;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
    color: #007bff;
  }
  
  label {
    font-size: 1rem;
    margin-bottom: 5px;
    display: block;
  }
  
  input {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #dee2e6;
    border-radius: 5px;
    font-size: 1rem;
  }
  
  button {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .result {
    margin-top: 20px;
    font-size: 1.2rem;
    color: #343a40;
  }
  
  .no-result {
    color: #dc3545;
  }
  </style>
  