<script lang="ts">
    import { goto } from '$app/navigation';
    import { setupStore, type GameMode } from '$lib/setup_store.svelte';

    let mode: GameMode = $state(setupStore.mode);
    let numPlayers: number = $state(setupStore.numPlayers);
    let numMinority: number = $state(setupStore.numMinority);
    let names: string[] = $state(setupStore.names);

    function setPlayers(n: number) {
        setupStore.setPlayersCount(n);
        numPlayers = setupStore.numPlayers;
        names = setupStore.names;
        numMinority = setupStore.numMinority;
    }

    function allowedMinorityOptions(): number[] {
        return setupStore.allowedMinorityOptions();
    }

    function generateBoard() {
        setupStore.mode = mode;
        setupStore.numPlayers = numPlayers;
        setupStore.numMinority = numMinority;
        setupStore.names = names;
        goto('/game');
    }
</script>

<style>
    .container {
        max-width: 1100px;
        margin: 32px auto 56px;
        padding: 0 20px 20px;
    }
    .header {
        background: #ffd048;
        border-radius: 24px;
        padding: 20px 28px;
        display: grid;
        grid-template-columns: 96px 1fr;
        gap: 20px;
        align-items: center;
    }
    .logo {
        width: 96px;
        height: 96px;
        border-radius: 48px;
        background: #f2f2f2;
    }
    h1 { margin: 0; font-size: 40px; }
    .sub { margin-top: 8px; line-height: 1.35; }

    .section { margin-top: 28px; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; }
    .chip {
        padding: 10px 14px;
        border-radius: 14px;
        background: #eee;
        cursor: pointer;
        border: 2px solid transparent;
        font-weight: 700;
    }
    .chip.active { background: #ffa6f4; border-color: #000; }
    .chip.disabled { opacity: 0.4; cursor: not-allowed; }

    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px 28px;
        margin-top: 12px;
        max-width: 900px;
    }
    .input {
        width: 100%;
        padding: 12px 14px;
        border-radius: 10px;
        border: 2px solid #cfcfcf;
        background: #efefef;
        font-size: 16px;
    }
    .cta {
        width: 100%;
        margin-top: 28px;
        background: #ffd048;
        border: none;
        padding: 18px 20px;
        border-radius: 18px;
        font-size: 24px;
        font-weight: 900;
        box-shadow: 0 6px 0 #2b1b31;
        cursor: pointer;
    }
</style>

<div class="container">
    <div class="header">
        <div class="logo" aria-hidden="true"></div>
        <div>
            <h1>Game Setup</h1>
            <div class="sub">
                Espín-Noboa, L., Wagner, C., Strohmaier, M. et al. Inequality and inequity in
                network-based ranking and recommendation algorithms. Sci Rep 12, 2012 (2022).
                https://doi.org/10.1038/s41598-022-05434-1
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Mode</h2>
        <div class="row" style="margin-top:8px">
            <button class={`chip ${mode === 'competitive' ? 'active' : ''}`} onclick={() => mode = 'competitive'}>Competitive Mode</button>
            <button class={`chip ${mode === 'team' ? 'active' : ''}`} onclick={() => mode = 'team'}>Team-Based Mode</button>
        </div>
    </div>

    <div class="section">
        <h2>Select number of players</h2>
        <div class="row" style="margin-top:8px">
            {#each [6,7,8,9,10] as n}
                <button class={`chip ${numPlayers === n ? 'active' : ''}`} onclick={() => setPlayers(n)}>{n}</button>
            {/each}
        </div>
    </div>

    <div class="section">
        <h2>Select number of minority players</h2>
        <div class="row" style="margin-top:8px">
            {#each [1,2,3,4] as m}
                {#if allowedMinorityOptions().includes(m)}
                    <button class={`chip ${numMinority === m ? 'active' : ''}`} onclick={() => numMinority = m}>{m}</button>
                {:else}
                    <button class="chip disabled" disabled>{m}</button>
                {/if}
            {/each}
        </div>
    </div>

    <div class="section">
        <h2>Name your mushroom</h2>
        <div class="grid">
            {#each Array.from({ length: numPlayers }) as _, i}
                <input class="input" placeholder={`${i + 1}`} bind:value={names[i]} />
            {/each}
        </div>
    </div>

    <button class="cta" onclick={generateBoard}>Generate board</button>
</div>


