import { useState, type FormEvent } from 'react';
import {
    Box,
    Button,
    Heading,
    Input,
    Stack,
    Text,
} from '@chakra-ui/react';
import { login } from '@/utils/requests';

interface Props {
    onSuccess: () => void;
}

export default function LoginPage({ onSuccess }: Props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login({ username, password });
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box
            minH="100vh"
            minW="100vw"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="bg.subtle"
            px={4}
        >
            <Box
                as="form"
                onSubmit={handleSubmit}
                bg="bg"
                borderWidth="1px"
                borderRadius="xl"
                p={8}
                w="full"
                maxW="sm"
                shadow="md"
            >
                <Stack gap={6}>
                    <Heading size="lg" textAlign="center">
                        Sign in
                    </Heading>

                    {/* Email */}
                    <Stack gap={1}>
                        <Text fontSize="sm" fontWeight="medium">
                            Username
                        </Text>
                        <Input
                            type="text"
                            placeholder="your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </Stack>

                    {/* Password */}
                    <Stack gap={1}>
                        <Text fontSize="sm" fontWeight="medium">
                            Password
                        </Text>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </Stack>

                    {/* Error message */}
                    {error && (
                        <Text color="red.500" fontSize="sm" textAlign="center">
                            {error}
                        </Text>
                    )}

                    <Button type="submit" colorPalette="blue" loading={loading} w="full">
                        Sign in
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}
