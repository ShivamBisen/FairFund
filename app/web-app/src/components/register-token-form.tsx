'use client';
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import {z} from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { writeContract, readContract } from '@wagmi/core'
import { config as wagmiConfig } from "@/wagmi/config";
import { erc20ABI, fundingVaultABI } from "@/constants";
import axios from "axios";
import { parseUnits } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface RegisterTokenFormProps {
    votingTokenAddress: string;
    vaultId: number;
    vaultAddress: string;
}

const registerTokensForm = z.object({
    amountOfTokens: z.string({
        required_error: "Amount of tokens is required",
    }),
})

export function RegisterTokenForm({
    votingTokenAddress,
    vaultId,
    vaultAddress
}:RegisterTokenFormProps){

    const { address, isConnected } = useAccount();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof registerTokensForm>>({
        resolver: zodResolver(registerTokensForm),
        defaultValues: {
            amountOfTokens: ""
        }
    })

    async function handleSubmit(data: z.infer<typeof registerTokensForm>) {
        if (!isConnected || !address) {
            return;
        }
        try{
            const decimals = await readContract(wagmiConfig,{
                // @ts-ignore
                address: votingTokenAddress,
                abi: erc20ABI,
                functionName: 'decimals',
            })
            const amountOfTokens = parseUnits(data.amountOfTokens, decimals as number);
            console.log('amountOfTokens', amountOfTokens);
            console.log('vaultAddress', vaultAddress);
            
            
            await writeContract(wagmiConfig,{
                // @ts-ignore
                address: votingTokenAddress,
                abi: erc20ABI,
                functionName: 'approve',
                args: [vaultAddress, amountOfTokens],
            })
            const hash = await writeContract(wagmiConfig,{
                // @ts-ignore
                address: vaultAddress,
                abi: fundingVaultABI,
                functionName: 'register',
                args: [amountOfTokens],
            })
            await axios.post('/api/vault/register',{
                vaultId: vaultId,
                amountOfTokens: data.amountOfTokens
            })
            if(hash){
                toast({
                    title: "Register Successful",
                    description: (
                        <div className="w-[80%] md:w-[340px]">
                            <p className="truncate">Transaction hash: <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer">{hash}</a></p>
                        </div>
                    ),
                })
            }
            router.push(`/vault/${vaultId}`);
            router.refresh();
        }catch(err){
            toast({
                variant: 'destructive',
                title: 'Error while registering to vote.',
                description: 'Something went wrong. Please try again.'
            }) 
            console.log('[REGISTER_TOKEN_FORM] Error while registering to vote.', err);
        }
    }

    return (
        <Card className="m-6">
            <CardHeader>
                <CardTitle>
                    Register To Vote
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <FormField
                            name="amountOfTokens"
                            control={form.control}
                            render={({field})=>{
                                return (
                                    <FormItem>
                                        <FormLabel>
                                            Amount of Tokens
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="in ETH units."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The amount of voting tokens you want to lock in order to receive voting power token.
                                        </FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )
                            }}
                        />
                        <div className="w-full flex justify-center">
                            <Button size={"lg"}>
                                Submit
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}