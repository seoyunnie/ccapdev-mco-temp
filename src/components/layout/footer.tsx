import { ActionIcon, Container, Group, Text, Title } from "@mantine/core";
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter } from "@tabler/icons-react";

import { FOOTER_ITEMS } from "../../data/footer-items.ts";
import { AppLink } from "../app-link.tsx";

import styles from "./footer.module.css";

export function Footer() {
  return (
    <footer className={styles.applicationFooter}>
      <Container size="xl">
        <div className={styles.footerInnerLayout}>
          <div className={styles.footerLogoSection}>
            <Title order={3} c="pink" style={{ letterSpacing: "-0.02em" }}>
              Adormable
            </Title>
            <Text size="sm" c="dimmed" className={styles.footerDescriptionText}>
              Your all-in-one dormitory companion since 2026.
            </Text>
          </div>
          <div className={styles.footerLinkGroups}>
            {FOOTER_ITEMS.map((group) => (
              <div className={styles.footerGroupWrapper} key={group.title}>
                <Text className={styles.footerGroupTitle}>{group.title}</Text>
                {group.links.map((link) => (
                  <Text key={link.label} className={styles.footerLink} component={AppLink} to={link.to}>
                    {link.label}
                  </Text>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.footerBottomBar}>
          <Text c="dimmed" size="sm">
            &copy; 2026 Adormable All rights reserved.
          </Text>
          <Group gap={0} className={styles.socialIconGroup} justify="flex-end" wrap="nowrap">
            <ActionIcon size="lg" color="gray" variant="subtle">
              <IconBrandTwitter size={18} stroke={1.5} />
            </ActionIcon>
            <ActionIcon size="lg" color="gray" variant="subtle">
              <IconBrandFacebook size={18} stroke={1.5} />
            </ActionIcon>
            <ActionIcon size="lg" color="gray" variant="subtle">
              <IconBrandInstagram size={18} stroke={1.5} />
            </ActionIcon>
          </Group>
        </div>
      </Container>
    </footer>
  );
}
