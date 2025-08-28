export type GameMode = 'competitive' | 'team';

class SetupStore {
    mode: GameMode = $state('competitive');
    numPlayers: number = $state(6);
    numMinority: number = $state(1);
    names: string[] = $state(Array.from({ length: 6 }, () => ''));

    setPlayersCount(count: number) {
        this.numPlayers = count;
        if (this.names.length < count) {
            this.names = [
                ...this.names,
                ...Array.from({ length: count - this.names.length }, () => ''),
            ];
        } else if (this.names.length > count) {
            this.names = this.names.slice(0, count);
        }
        if (count === 6 && this.numMinority > 2) {
            this.numMinority = 2;
        }
    }

    allowedMinorityOptions(): number[] {
        if (this.numPlayers === 6) return [1, 2];
        return [1, 2, 3, 4];
    }

    reset() {
        this.mode = 'competitive';
        this.numPlayers = 6;
        this.numMinority = 1;
        this.names = Array.from({ length: 6 }, () => '');
    }
}

export const setupStore = new SetupStore();


