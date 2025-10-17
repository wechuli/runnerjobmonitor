import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Avatar,
  Text,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { api } from '../services/api';
import { Organization } from '../types';

interface OrganizationListPageProps {
  onSelectOrganization: (org: Organization) => void;
}

const OrganizationListPage: React.FC<OrganizationListPageProps> = ({ onSelectOrganization }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const data = await api.getOrganizations();
        setOrganizations(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Loading organizations...</Text>
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
      <Heading mb={6}>Select an Organization</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {organizations.map((org) => (
          <Card
            key={org.id}
            cursor="pointer"
            onClick={() => onSelectOrganization(org)}
            _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
            transition="all 0.2s"
          >
            <CardBody display="flex" alignItems="center" gap={4}>
              <Avatar src={org.avatarUrl || undefined} name={org.name} size="lg" />
              <Box>
                <Text fontWeight="bold" fontSize="lg">
                  {org.name}
                </Text>
                <Text color="gray.500">@{org.login}</Text>
              </Box>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default OrganizationListPage;
