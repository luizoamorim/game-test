import { Character, PrismaClient } from "@prisma/client";
import ICharacterRepository from "../../ICharacterRepository";

export default class CharacterRepositoryPg implements ICharacterRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async save(character: Character): Promise<Character> {
        return await this.prisma.character.create({ data: character });
    }

    async findById(id: number): Promise<Character> {
        const character = await this.prisma.character.findUnique({
            where: { id },
        });
        return character as Character;
    }

    async update(character: Character): Promise<Character> {
        return await this.prisma.character.update({
            where: { id: character.id },
            data: character,
        });
    }

    async delete(id: number): Promise<Character> {
        const characterDeleted = await this.prisma.character.delete({
            where: { id },
        });
        return characterDeleted;
    }

    async discard(characterId: number, itemId: number): Promise<Character> {
        const characterUpdated = await this.prisma.character.update({
            where: { id: characterId },
            data: {
                items: {
                    disconnect: { id: itemId },
                },
            },
        });

        return characterUpdated;
    }

    async discardMany(
        characterId: number,
        itemsId: number[],
    ): Promise<Character> {
        const characterUpdated = await this.prisma.character.update({
            where: { id: characterId },
            data: {
                items: {
                    disconnect: itemsId.map((id) => ({ id })),
                },
            },
        });

        return characterUpdated;
    }
}
