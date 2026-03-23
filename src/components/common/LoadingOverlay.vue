<template>
    <div class="drop-overlay">
        <div class="spinner-box">
            <span class="overlay-loader"></span>
        </div>
    </div>
</template>
<script>
export default {
    name: 'DropOverlay',

    props: {
        show: {
            type: Boolean,
            default: false
        }
    },

    watch: {
        show(newVal) {
            const el = document.querySelector('.drop-overlay')
            if (newVal) {
                el.style.display = 'flex'
                el.offsetHeight
                el.style.opacity = '1'
            } else {
                el.style.opacity = '0'
                setTimeout(() => {
                    if (!this.show) {
                        el.style.display = 'none'
                    }
                }, 300)
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.drop-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    transition: opacity 0.15s ease-in-out;

    .spinner-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 6rem;
        height: 6rem;
        background: rgba(255, 255, 255, 0.833);
        backdrop-filter: blur(15px);
        border-radius: 16px;
        box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
    }

    &[style*='opacity: 1'] .loading-box {
        transform: scale(1);
    }
}

.overlay-loader {
    width: 50px;
    height: 50px;
    border: 5px solid #008bcc;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
