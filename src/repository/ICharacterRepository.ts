import { Character } from "@prisma/client";

export default interface ICharacterRepository {
    save(character: Character): Promise<Character>;

    findById(id: number): Promise<Character>;

    update(character: Character): Promise<Character>;

    delete(id: number): Promise<Character>;

    discard(characterId: number, itemId: number): Promise<Character>;

    discardMany(characterId: number, itemsId: number[]): Promise<Character>;
}
