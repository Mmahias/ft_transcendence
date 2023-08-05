<template>
    <div class="container">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway">
      <h1>Welcome to Transcendence Project</h1>
      <hr class="border-grey" style="margin:auto;width:60%">
      <svg class="pulse" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <circle id="Oval" cx="512" cy="512" r="512"></circle>
      </svg>
      <p></p>
      <div class="buttons">
        <button class="button button1">SignUp</button>
        <button class="button button1">Sign-In</button>
      </div>
    </div>
</template>

<script>
export default {
  name: 'HelloWorld'
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div {
  display: block;
}
h1, hr {
  font-family: 'Raleway', sans-serif;
  height: 100%;
  font-size: 80px;
  /*font-size: 5rem;*/
  text-shadow: 0px 1px 0px rgba(255, 255, 255, 1);
  color: #252424ce;
}
.container {
  /*width: device-width;*/
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /*position: relative;*/
  /*z-index: 0;*/
  /*background-color: #ededed;*/
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
}

.pulse {
  z-index: -1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 40rem;
  
}

.button {
  border: none;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 5px 10px;
    cursor: pointer;
    background-color: #555555; 
    color: white;
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);

}
</style>
