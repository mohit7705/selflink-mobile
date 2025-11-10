import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { UserAvatar } from '@components/UserAvatar';
import { useAuthStore } from '@store/authStore';

export function ProfileScreen() {
  const { currentUser, personalMap, hasCompletedPersonalMap, logout } = useAuthStore((state) => ({
    currentUser: state.currentUser,
    personalMap: state.personalMap,
    hasCompletedPersonalMap: state.hasCompletedPersonalMap,
    logout: state.logout,
  }));

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  if (!currentUser) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>We could not load your profile.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <UserAvatar uri={currentUser.photo} label={currentUser.name} size={72} />
        <Text style={styles.name}>{currentUser.name}</Text>
        <Text style={styles.handle}>@{currentUser.handle}</Text>
        <Text style={styles.meta}>{currentUser.email}</Text>
        {currentUser.birth_place ? <Text style={styles.meta}>{currentUser.birth_place}</Text> : null}
        <Text style={styles.sectionTitle}>Personal map</Text>
        {hasCompletedPersonalMap && personalMap ? (
          <View style={styles.mapGrid}>
            <InfoRow label="First name" value={personalMap.first_name} />
            <InfoRow label="Last name" value={personalMap.last_name} />
            <InfoRow label="Birth date" value={personalMap.birth_date ?? 'N/A'} />
            <InfoRow label="Birth time" value={personalMap.birth_time ?? 'N/A'} />
            <InfoRow label="Birth city" value={personalMap.birth_place_city} />
            <InfoRow label="Country" value={personalMap.birth_place_country} />
          </View>
        ) : (
          <Text style={styles.meta}>
            Complete your personal map to unlock mentor, matrix, and soul match insights.
          </Text>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutLabel}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#020617',
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  handle: {
    color: '#94A3B8',
  },
  meta: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  mapGrid: {
    alignSelf: 'stretch',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#94A3B8',
  },
  infoValue: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 24,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutLabel: {
    color: '#EF4444',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
  },
  emptyStateText: {
    color: '#94A3B8',
  },
});
