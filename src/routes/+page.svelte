<script lang="ts">
    import { goto } from '$app/navigation';

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
        background: #f6f6f6;
    }
    .panel {
        width: min(1100px, 92vw);
        height: min(700px, 86vh);
        background: #ffa6f4;
        border-radius: 40px;
        display: grid;
        grid-template-rows: 1fr auto auto auto 1fr;
        justify-items: center;
        text-align: center;
        box-shadow: 0 2px 0 rgba(0,0,0,0.2) inset;
    }
    .logo {
        width: 180px;
        height: 180px;
        margin-top: 60px;
        background: #f2f2f2;
        border-radius: 32px;
    }
    h1 {
        font-size: clamp(36px, 7vw, 80px);
        margin: 24px 16px 8px;
        font-weight: 900;
        letter-spacing: 1px;
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
        border-radius: 18px;
        box-shadow: 0 6px 0 #2b1b31;
        cursor: pointer;
        transition: transform 120ms ease, box-shadow 120ms ease;
        margin-bottom: 60px;
    }
    .cta:active {
        transform: translateY(3px);
        box-shadow: 0 3px 0 #2b1b31;
    }
</style>

<div class="wrap">
    <section class="panel">
        <div class="logo" aria-hidden="true"></div>
        <h1>SHROOM BOOM!</h1>
        <p class="cite">
            Espín-Noboa, L., Wagner, C., Strohmaier, M. et al. Inequality and inequity in
            network-based ranking and recommendation algorithms. Sci Rep 12, 2012 (2022).
            https://doi.org/10.1038/s41598-022-05434-1
        </p>
        <button class="cta" onclick={launch}>Launch Game</button>
    </section>
</div>
