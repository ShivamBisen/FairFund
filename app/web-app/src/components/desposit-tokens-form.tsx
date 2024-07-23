'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseUnits } from 'viem';
import {
    writeContract,
    readContract,
    waitForTransactionReceipt,
} from '@wagmi/core';
import { config as wagmiConfig } from '@/wagmi/config';
import { erc20ABI, fundingVaultABI } from '@/blockchain/constants';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useWeb3FormSubmit } from '@/hooks/use-web3-form-submit';
import { Web3SubmitButton } from '@/components/web3-submit-button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface DepositTokensFormProps {
    fundingTokenAddress: string;
    vaultAddress: string;
    vaultId: number;
    isCreateVault?: boolean;
}

const depositTokensForm = z.object({
    amountOfTokens: z.string().min(1, 'Amount of tokens is required'),
});

export default function DepositTokensForm({
    fundingTokenAddress,
    vaultAddress,
    vaultId,
    isCreateVault = false,
}: DepositTokensFormProps) {
    const { handleSubmit, isLoading } =
        useWeb3FormSubmit<z.infer<typeof depositTokensForm>>();
    const router = useRouter();
    const form = useForm<z.infer<typeof depositTokensForm>>({
        resolver: zodResolver(depositTokensForm),
        defaultValues: {
            amountOfTokens: '',
        },
    });

    const onSubmit = handleSubmit(
        async (data: z.infer<typeof depositTokensForm>) => {
            const decimals = (await readContract(wagmiConfig, {
                address: fundingTokenAddress as `0x${string}`,
                abi: erc20ABI,
                functionName: 'decimals',
            })) as number;
            const amountOfTokens = parseUnits(data.amountOfTokens, decimals);
            const hash = await writeContract(wagmiConfig, {
                address: fundingTokenAddress as `0x${string}`,
                abi: erc20ABI,
                functionName: 'approve',
                args: [vaultAddress, amountOfTokens],
            });
            await waitForTransactionReceipt(wagmiConfig, {
                hash: hash,
            });
            const depositHash = await writeContract(wagmiConfig, {
                address: vaultAddress as `0x${string}`,
                abi: fundingVaultABI,
                functionName: 'deposit',
                args: [amountOfTokens],
            });
            await waitForTransactionReceipt(wagmiConfig, {
                hash: depositHash,
            });
            return { depositHash, message: 'Tokens deposited successfully.' };
        },
        isCreateVault ? '/dashboard' : `/vault/${vaultId}`
    );

    const handleSkip = () => {
        router.push('/dashboard');
    };

    return (
        <Card className="w-[90%] mx-auto my-10">
            <CardHeader>
                <CardTitle>Deposit Tokens</CardTitle>
            </CardHeader>
            <CardContent className={cn(isCreateVault && 'w-full')}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            name="amountOfTokens"
                            control={form.control}
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Amount of Tokens</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="in ETH units."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            This will trigger a blockchain
                                            transaction.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                        <div className="w-full flex justify-center">
                            <Web3SubmitButton isLoading={isLoading}>
                                Submit
                            </Web3SubmitButton>
                        </div>
                    </form>
                </Form>
                {isCreateVault && (
                    <Alert className="mt-4">
                        <AlertDescription>
                            You can skip depositing tokens for now.{' '}
                            <Button
                                variant="link"
                                className="p-0 h-auto font-normal"
                                onClick={handleSkip}
                            >
                                Skip and go to dashboard
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
