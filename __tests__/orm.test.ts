import { Payroll } from "@/models/payroll";
import { Transcription } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { test, describe, expect, afterAll, expectTypeOf } from "vitest";


describe("ORM works", () => {
    afterAll(async () => {
        await prisma.$disconnect()
    })

    let transcription: Transcription;
    const payroll: Payroll = {
        pages: [
            {
                page: 0,
                year: "2025",
                month: "01",
                fields: [
                    {
                        code: "201",
                        label: "Verba X",
                        reference: "200",
                        value: "300"
                    }
                ],
                bases: [
                    {
                        label: "Base X",
                        value: "400"
                    }
                ],
            }
        ]
    }

    test("Can create transcription", async () => {
        transcription = await prisma.transcription.create({
            data: {
                tipo: "Payroll",
                status: "processando"
            },
        })
    })

    test("Transcription created as processing", async () => {
        const retrived = await prisma.transcription.findUniqueOrThrow({
            where: { id: transcription.id }
        })

        expect(retrived).toStrictEqual(transcription)
    })

    test("Can update transcription", async () => {
        transcription = await prisma.transcription.update({
            where: { id: transcription.id },
            data: {
                status: "concluido",
                value: payroll
            },
        })

        expect(transcription.status).toBe("concluido")
        expect(transcription.value).toMatchObject(payroll)
    })
})