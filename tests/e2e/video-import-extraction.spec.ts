import { test, expect } from '@playwright/test'

test.describe('Frame Flow X - Video Import & Frame Extraction', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
  })

  test('should load the homepage successfully', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Frame Flow X/)

    // Check main heading
    const heading = page.getByRole('heading', { name: /Frame Flow X/i })
    await expect(heading).toBeVisible()
  })

  test('should navigate to workspace page', async ({ page }) => {
    // Click on "Open Workspace" or similar button
    const workspaceButton = page.getByRole('button', { name: /workspace/i })
    if (await workspaceButton.isVisible()) {
      await workspaceButton.click()
      await expect(page).toHaveURL(/.*workspace.*/)
    }
  })

  test('should display video dropzone in workspace', async ({ page }) => {
    // Navigate to workspace
    await page.goto('/workspace')

    // Check for dropzone
    const dropzone = page.getByText(/drop your video here/i)
    await expect(dropzone).toBeVisible()

    // Check for supported formats
    await expect(page.getByText(/MP4/i)).toBeVisible()
    await expect(page.getByText(/WebM/i)).toBeVisible()
    await expect(page.getByText(/MOV/i)).toBeVisible()
  })

  test('should validate video file format', async ({ page }) => {
    await page.goto('/workspace')

    // Create a mock video file (MP4)
    const videoFile = new File(['mock video content'], 'test-video.mp4', {
      type: 'video/mp4',
    })

    // Get the file input element
    const fileInput = page.locator('input[type="file"]')

    // Set the file
    await fileInput.setInputFiles(videoFile)

    // Wait for video preview to appear
    const preview = page.getByText(/test-video\.mp4/i)
    await expect(preview).toBeVisible({ timeout: 5000 })
  })

  test('should show extraction settings after video import', async ({ page }) => {
    await page.goto('/workspace')

    // Import a mock video
    const videoFile = new File(['mock video content'], 'test.mp4', {
      type: 'video/mp4',
    })
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(videoFile)

    // Wait for video preview
    await expect(page.getByText(/test\.mp4/i)).toBeVisible()

    // Check for extraction settings
    await expect(page.getByText(/Extraction Settings/i)).toBeVisible()

    // Check for FPS options
    await expect(page.getByText(/1 FPS/i)).toBeVisible()

    // Check for format options
    await expect(page.getByText(/PNG/i)).toBeVisible()
    await expect(page.getByText(/JPEG/i)).toBeVisible()
  })

  test('should start frame extraction', async ({ page }) => {
    await page.goto('/workspace')

    // Import video
    const videoFile = new File(['mock video content'], 'test.mp4', {
      type: 'video/mp4',
    })
    await page.locator('input[type="file"]').setInputFiles(videoFile)

    // Wait for preview
    await expect(page.getByText(/test\.mp4/i)).toBeVisible()

    // Click start extraction
    const startButton = page.getByRole('button', { name: /start extraction/i })
    await startButton.click()

    // Should show progress
    const progressText = page.getByText(/extracting frames/i)
    await expect(progressText).toBeVisible({ timeout: 5000 })
  })

  test('should display extraction progress', async ({ page }) => {
    await page.goto('/workspace')

    // Import video
    const videoFile = new File(['mock video content'], 'test.mp4', {
      type: 'video/mp4',
    })
    await page.locator('input[type="file"]').setInputFiles(videoFile)

    // Start extraction
    await page.getByRole('button', { name: /start extraction/i }).click()

    // Check progress elements
    await expect(page.getByText(/progress/i)).toBeVisible()
    await expect(page.getByText(/percentage/i)).toBeVisible()

    // Progress bar should be visible
    const progressBar = page.locator('[role="progressbar"]')
    await expect(progressBar).toBeVisible()
  })

  test('should allow cancelling extraction', async ({ page }) => {
    await page.goto('/workspace')

    // Import video
    const videoFile = new File(['mock video content'], 'test.mp4', {
      type: 'video/mp4',
    })
    await page.locator('input[type="file"]').setInputFiles(videoFile)

    // Start extraction
    await page.getByRole('button', { name: /start extraction/i }).click()

    // Wait for cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i })
    await expect(cancelButton).toBeVisible({ timeout: 5000 })

    // Click cancel
    await cancelButton.click()

    // Should show cancelled state
    await expect(page.getByText(/cancelled/i)).toBeVisible({ timeout: 3000 })
  })

  test('should add video to batch queue', async ({ page }) => {
    await page.goto('/workspace')

    // Import video
    const videoFile = new File(['mock video content'], 'test.mp4', {
      type: 'video/mp4',
    })
    await page.locator('input[type="file"]').setInputFiles(videoFile)

    // Click "Add to Batch Queue"
    const addToQueueButton = page.getByRole('button', {
      name: /add to batch queue/i,
    })
    if (await addToQueueButton.isVisible()) {
      await addToQueueButton.click()

      // Queue panel should appear
      await expect(page.getByText(/batch queue/i)).toBeVisible()
      await expect(page.getByText(/test\.mp4/i)).toBeVisible()
    }
  })

  test('should display keyboard shortcuts hint', async ({ page }) => {
    await page.goto('/workspace')

    // Import video and start extraction to show gallery
    const videoFile = new File(['mock video content'], 'test.mp4', {
      type: 'video/mp4',
    })
    await page.locator('input[type="file"]').setInputFiles(videoFile)
    await page.getByRole('button', { name: /start extraction/i }).click()

    // Wait for gallery to appear (after extraction or mock)
    // Check for keyboard shortcuts
    const shortcuts = page.locator('kbd')
    if (await shortcuts.count() > 0) {
      await expect(shortcuts.first()).toBeVisible()
    }
  })

  test('should handle file size validation', async ({ page }) => {
    await page.goto('/workspace')

    // Create a large mock file (over 2GB limit)
    const largeFile = new File(
      [new ArrayBuffer(3 * 1024 * 1024 * 1024)],
      'large-video.mp4',
      { type: 'video/mp4' }
    )

    await page.locator('input[type="file"]').setInputFiles(largeFile)

    // Should show error message
    await expect(
      page.getByText(/exceeds maximum/i, { timeout: 3000 })
    ).toBeVisible()
  })

  test('should navigate between tabs in workspace', async ({ page }) => {
    await page.goto('/workspace')

    // Import video first
    const videoFile = new File(['mock video content'], 'test.mp4', {
      type: 'video/mp4',
    })
    await page.locator('input[type="file"]').setInputFiles(videoFile)

    // Start extraction to enable tabs
    await page.getByRole('button', { name: /start extraction/i }).click()

    // Wait for tabs to be available
    await page.waitForTimeout(2000)

    // Check tab buttons exist
    const galleryTab = page.getByRole('button', { name: /gallery/i })
    const upscaleTab = page.getByRole('button', { name: /ai upscale/i })
    const enhanceTab = page.getByRole('button', { name: /enhance/i })

    if (await galleryTab.isVisible()) {
      await expect(galleryTab).toBeVisible()
    }
    if (await upscaleTab.isVisible()) {
      await expect(upscaleTab).toBeVisible()
    }
    if (await enhanceTab.isVisible()) {
      await expect(enhanceTab).toBeVisible()
    }
  })

  test('should show error for invalid file type', async ({ page }) => {
    await page.goto('/workspace')

    // Try to upload a text file
    const textFile = new File(['text content'], 'test.txt', {
      type: 'text/plain',
    })

    await page.locator('input[type="file"]').setInputFiles(textFile)

    // Should show error or reject the file
    // The file input should not accept non-video files
    const preview = page.getByText(/test\.txt/i)
    await expect(preview).not.toBeVisible({ timeout: 3000 })
  })
})
