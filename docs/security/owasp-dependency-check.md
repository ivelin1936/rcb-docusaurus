---
id: owasp-dependency-check
title: OWASP Dependency Check
sidebar_label: OWASP Dependency Check
sidebar_position: 3
tags: [security, owasp, dependency-check, cve, maven, ci]
---

# OWASP Dependency Check

OWASP Dependency Check is a software composition analysis (SCA) tool that detects publicly disclosed vulnerabilities (CVEs) in project dependencies. It cross-references all Maven JARs against the [National Vulnerability Database (NVD)](https://nvd.nist.gov/) and generates an HTML/JSON report.

The RCB backend runs this scan as a Maven profile — both locally on demand and automatically every week in CI via `security-scan.yml`.

---

## Why We Use It

- Spring Boot applications depend on dozens of third-party libraries. Any one of them can have a newly disclosed CVE.
- The NVD database is updated daily. A library that was safe when added may have a critical vulnerability discovered months later.
- OWASP Dependency Check provides an automated, reproducible way to catch these issues before they reach production.

---

## Running the Scan

### Local — Full Aggregate Scan

Run from the repository root:

```bash
./mvnw dependency-check:aggregate -Powasp
```

This scans all Maven modules (`core`, `rest`, `perf-tests`) and produces a single aggregate report.

### Against Staging URL (report only — no build)

```bash
./mvnw dependency-check:aggregate -Powasp -DskipTests
```

### View the Report

```bash
# HTML report (open in browser)
open target/dependency-check-reports/dependency-check-report.html

# JSON report (machine-readable, used by CI)
cat target/dependency-check-reports/dependency-check-report.json
```

On Linux without a desktop:

```bash
python3 -m http.server 8888 --directory target/dependency-check-reports
# Navigate to http://localhost:8888/dependency-check-report.html
```

---

## Maven Configuration

The `owasp` profile is defined in the root `pom.xml`:

```xml
<profile>
  <id>owasp</id>
  <build>
    <plugins>
      <plugin>
        <groupId>org.owasp</groupId>
        <artifactId>dependency-check-maven</artifactId>
        <version>10.0.3</version>
        <configuration>
          <!-- Fail the build if any dependency has CVSS score >= 9.0 (CRITICAL) -->
          <failBuildOnCVSS>9</failBuildOnCVSS>

          <!-- Report formats: HTML for humans, JSON for CI parsing -->
          <formats>
            <format>HTML</format>
            <format>JSON</format>
          </formats>

          <!-- Aggregate report location -->
          <outputDirectory>${project.build.directory}/dependency-check-reports</outputDirectory>

          <!-- Suppress known false positives -->
          <suppressionFile>owasp-suppressions.xml</suppressionFile>

          <!-- Skip test-scope dependencies (JUnit, Mockito, etc.) -->
          <skipTestScope>true</skipTestScope>

          <!-- NVD API key (optional — see NVD API Key section) -->
          <nvdApiKey>${env.NVD_API_KEY}</nvdApiKey>
        </configuration>
        <executions>
          <execution>
            <goals>
              <goal>aggregate</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
</profile>
```

---

## Severity Classification

| Severity | CVSS Score | Action Required |
|----------|-----------|-----------------|
| **CRITICAL** | 9.0 – 10.0 | **Build fails automatically.** Must be resolved (upgrade or suppress with justification) before merge. |
| **HIGH** | 7.0 – 8.9 | Review within 72 hours. Upgrade or add suppression with ticket reference. |
| **MEDIUM** | 4.0 – 6.9 | Schedule for next sprint. Track in backlog. |
| **LOW** | 0.1 – 3.9 | Monitor — address in bulk dependency upgrade cycles. |

:::warning Critical = Build Failure
Any CVSS score ≥ 9.0 will cause `./mvnw dependency-check:aggregate -Powasp` to exit with a non-zero code. The CI weekly scan will fail and Slack will be notified.
:::

---

## Suppressing False Positives

Some CVEs are flagged incorrectly because the NVD CPE matching is imprecise. A common example: a CVE for a `log4j` C library is matched against the Java `log4j` JAR.

Suppressions are stored in `owasp-suppressions.xml` at the repository root.

### Suppression File Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<suppressions xmlns="https://jeremylong.github.io/DependencyCheck/dependency-suppression.1.3.xsd">

  <!--
    CVE-2021-44228 (Log4Shell) — false positive on logback-classic.
    Logback does not use Log4j 2 JNDI lookup. Verified 2026-03-01.
    Ticket: RCB-823
  -->
  <suppress>
    <notes>False positive: logback-classic is not Log4j 2</notes>
    <gav regex="true">^ch\.qos\.logback:logback-classic:.*$</gav>
    <cve>CVE-2021-44228</cve>
  </suppress>

  <!--
    CVE-2022-1471 (SnakeYAML) — used only in test scope via Spring Boot test auto-configuration.
    Production classpath does not load untrusted YAML from external sources.
    Reviewed 2026-02-15. Re-evaluate when upgrading Spring Boot.
    Ticket: RCB-851
  -->
  <suppress>
    <notes>SnakeYAML untrusted deserialization — not exploitable in our usage</notes>
    <gav regex="true">^org\.yaml:snakeyaml:.*$</gav>
    <cve>CVE-2022-1471</cve>
  </suppress>

</suppressions>
```

### Suppression Rules

Every suppression entry **must** include:

1. A `<notes>` element explaining why it is a false positive or why it is accepted
2. The CVE identifier(s) being suppressed
3. The affected GAV coordinates (group:artifact:version) — use `regex="true"` for version wildcards
4. A ticket/issue reference (e.g. `RCB-NNN`) so suppressions are reviewable

**Never suppress a CVE without a justification comment.** Suppressions without notes will be rejected in PR review.

---

## CI Integration — Weekly Scan

The scan runs every Saturday at 02:00 UTC via `.github/workflows/security-scan.yml`. See [Weekly Security Scan](./weekly-security-scan) for the full workflow.

The CI scan uses a cached NVD database to avoid downloading the full database on every run:

```yaml
- name: Cache NVD database
  uses: actions/cache@v4
  with:
    path: ~/.m2/repository/org/owasp/dependency-check-data
    key: nvd-${{ runner.os }}-${{ hashFiles('pom.xml') }}
    restore-keys: nvd-${{ runner.os }}-
```

---

## NVD API Key Setup

Without an API key, the NVD feed download is rate-limited to 5 requests per 30 seconds. For CI pipelines, this can cause the database update step to take 10–15 minutes or time out.

### Obtaining an API Key

1. Register at [https://nvd.nist.gov/developers/request-an-api-key](https://nvd.nist.gov/developers/request-an-api-key)
2. The key is emailed to you within minutes (free)
3. Add it to GitHub Actions secrets: `NVD_API_KEY`

### Local Usage

```bash
NVD_API_KEY=your-key-here ./mvnw dependency-check:aggregate -Powasp
```

:::info NVD API Key is Optional
The scan runs correctly without an API key — it just downloads the NVD database more slowly. For local developer use, skipping the API key is fine. In CI, the NVD cache (`~/.m2/repository/org/owasp/dependency-check-data`) usually means the full database download only happens on first run or when the cache expires.
:::

---

## Dependency Upgrade Workflow

When a CRITICAL or HIGH CVE is found:

1. Check if a fixed version is available: `./mvnw versions:display-dependency-updates`
2. Update the version in the relevant `pom.xml`
3. Re-run `./mvnw clean verify` to ensure no breaking changes
4. Re-run `./mvnw dependency-check:aggregate -Powasp` to confirm the CVE is resolved
5. If no fix is available yet, add a suppression with ticket reference and set a reminder to re-evaluate

---

## References

- [OWASP Dependency Check Documentation](https://jeremylong.github.io/DependencyCheck/)
- [NVD CVSS Scoring](https://nvd.nist.gov/vuln-metrics/cvss)
- [NVD API Key Request](https://nvd.nist.gov/developers/request-an-api-key)
- [Suppression File Schema](https://jeremylong.github.io/DependencyCheck/dependency-suppression.1.3.xsd)
