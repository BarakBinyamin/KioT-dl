<template>
    <div>
        <div v-for="song in songs">
            {{song.title}}
        </div>
    </div>
</template>

<script>
export default{
    props: ["songs"]
}
</script>

<style scoped>
.list{
display: grid;
width  : 100%;
}
</style>