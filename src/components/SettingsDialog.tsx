"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition, RadioGroup } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useTheme } from "next-themes";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const themes = [
  { id: "light", name: "Light", description: "Default light theme" },
  { id: "dark", name: "Dark", description: "Dark theme for low-light environments" },
];

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(session?.user?.name || "");

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, theme }),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      // Update session
      await update({ name });

      // Update theme
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
      localStorage.setItem("theme", theme);

      toast.success("Settings updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-card p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-medium text-foreground">
                    Settings
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2">Display Name</h3>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2">Theme</h3>
                    <RadioGroup value={theme} onChange={setTheme} className="space-y-2">
                      <RadioGroup.Option value="light">
                        {({ checked }) => (
                          <div
                            className={`${checked
                              ? "bg-primary-50 border-primary-500 ring-2 ring-primary-500"
                              : "border-base hover:bg-muted"
                              } relative flex cursor-pointer rounded-lg px-5 py-4 border focus:outline-none transition-colors`}
                          >
                            <div className="flex w-full items-center justify-between">
                              <div className="flex items-center">
                                <div className="text-sm">
                                  <RadioGroup.Label
                                    as="p"
                                    className={`font-medium ${checked ? "text-primary-900" : "text-foreground"
                                      }`}
                                  >
                                    Light
                                  </RadioGroup.Label>
                                  <RadioGroup.Description
                                    as="span"
                                    className={`inline ${checked ? "text-primary-700" : "text-muted"
                                      }`}
                                  >
                                    Light theme for daytime use
                                  </RadioGroup.Description>
                                </div>
                              </div>
                              {checked && (
                                <div className="shrink-0 text-primary-500">
                                  <CheckIcon className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </RadioGroup.Option>

                      <RadioGroup.Option value="dark">
                        {({ checked }) => (
                          <div
                            className={`${checked
                              ? "bg-primary-50 border-primary-500 ring-2 ring-primary-500"
                              : "border-base hover:bg-muted"
                              } relative flex cursor-pointer rounded-lg px-5 py-4 border focus:outline-none transition-colors`}
                          >
                            <div className="flex w-full items-center justify-between">
                              <div className="flex items-center">
                                <div className="text-sm">
                                  <RadioGroup.Label
                                    as="p"
                                    className={`font-medium ${checked ? "text-primary-900" : "text-foreground"
                                      }`}
                                  >
                                    Dark
                                  </RadioGroup.Label>
                                  <RadioGroup.Description
                                    as="span"
                                    className={`inline ${checked ? "text-primary-700" : "text-muted"
                                      }`}
                                  >
                                    Dark theme for nighttime use
                                  </RadioGroup.Description>
                                </div>
                              </div>
                              {checked && (
                                <div className="shrink-0 text-primary-500">
                                  <CheckIcon className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </RadioGroup.Option>

                      <RadioGroup.Option value="system">
                        {({ checked }) => (
                          <div
                            className={`${checked
                              ? "bg-primary-50 border-primary-500 ring-2 ring-primary-500"
                              : "border-base hover:bg-muted"
                              } relative flex cursor-pointer rounded-lg px-5 py-4 border focus:outline-none transition-colors`}
                          >
                            <div className="flex w-full items-center justify-between">
                              <div className="flex items-center">
                                <div className="text-sm">
                                  <RadioGroup.Label
                                    as="p"
                                    className={`font-medium ${checked ? "text-primary-900" : "text-foreground"
                                      }`}
                                  >
                                    System
                                  </RadioGroup.Label>
                                  <RadioGroup.Description
                                    as="span"
                                    className={`inline ${checked ? "text-primary-700" : "text-muted"
                                      }`}
                                  >
                                    Follow system theme preference
                                  </RadioGroup.Description>
                                </div>
                              </div>
                              {checked && (
                                <div className="shrink-0 text-primary-500">
                                  <CheckIcon className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </RadioGroup.Option>
                    </RadioGroup>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-base px-4 py-2 text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                      onClick={handleSubmit}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="currentColor" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
