import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { api } from '../services/api';
import { Organization, Repository } from '../types';

interface RepositoryListPageProps {
  organization: Organization;
  onSelectRepository: (repo: Repository) => void;
  onBack: () => void;
}

const RepositoryListPage: React.FC<RepositoryListPageProps> = ({
  organization,
  onSelectRepository,
  onBack,
}) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        const data = await api.getRepositories(organization.login);
        setRepositories(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repositories');
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [organization]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Loading repositories...</Text>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Button onClick={onBack} mb={4}>
        ← Back to Organizations
      </Button>
      <Heading mb={6}>
        Repositories in {organization.name}
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {repositories.map((repo) => (
          <Card
            key={repo.fullName}
            cursor="pointer"
            onClick={() => onSelectRepository(repo)}
            _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
            transition="all 0.2s"
          >
            <CardBody>
              <Text fontWeight="bold" fontSize="lg" mb={2}>
                {repo.name}
              </Text>
              {repo.description && (
                <Text color="gray.500" fontSize="sm">
                  {repo.description}
                </Text>
              )}
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default RepositoryListPage;
