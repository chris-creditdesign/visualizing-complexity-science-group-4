<script lang="ts">
    import { goto } from '$app/navigation';
    import hero from '$lib/assets/hero_image.png';

    function launch() {
        goto('/setup');
    }
</script>

<style>
    .wrap {
        min-height: 100dvh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: #C7E9B2;
    }
    .panel {
        width: min(1100px, 92vw);
        height: min(700px, 86vh);
        background: #C7E9B2;
        border-radius: 40px;
        display: grid;
        grid-template-rows: 1fr auto auto auto 1fr;
        justify-items: center;
        text-align: center;
        
    }
    h1 {
        font-size: clamp(36px, 7vw, 80px);
        margin: 24px 16px 8px;
        font-weight: 900;
        letter-spacing: 1px;
        color: #3E6E20;
    }
    .cite {
        max-width: 760px;
        margin: 8px 24px 28px;
        line-height: 1.35;
    }
    .cta {
        appearance: none;
        border: none;
        background: #ffd048;
        color: #111;
        font-weight: 800;
        font-size: clamp(18px, 2.6vw, 24px);
        padding: 16px 28px;
        border-radius: 30px;
        border: 2px solid black;
        box-shadow: 0 6px 0 #2b1b31;
        cursor: pointer;
        transition: transform 120ms ease, box-shadow 120ms ease;
        margin-bottom: 60px;
    }
    .cta:active {
        transform: translateY(3px);
        box-shadow: 0 3px 0 #2b1b31;
    }

    .cite {
        font-family: --font-family-serif;
    }
</style>

<div class="wrap">
    <section class="panel">
        <h1>SHROOM BOOM!</h1>
        <img alt="The project logo" src={hero} />
        <p class="cite">
            In the forest, orange mushrooms rule the ground while blue mushrooms fight to grow. Every connection you make reshapes the network and the balance of power.
        </p>
        <button class="cta" onclick={launch}>Launch Game</button>
    </section>
</div>
