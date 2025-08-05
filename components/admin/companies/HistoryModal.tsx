// components/admin/companies/HistoryModal.tsx
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AdminCompany } from "@/app/(admin)/admincompanies/page"

interface HistoryModalProps {
  company: AdminCompany | null
  onClose: () => void
}

const HistoryModal: React.FC<HistoryModalProps> = ({ company, onClose }) => {
  return (
    <Dialog open={!!company} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Company History</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {company?.history && company.history.length > 0 ? (
            company.history.map((entry, index) => (
              <div
                key={index}
                className="text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2"
              >
                • {entry}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No history available.</p>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default HistoryModal
